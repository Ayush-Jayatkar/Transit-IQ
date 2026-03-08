"""
Anomaly detection using scikit-learn IsolationForest.
Flags routes where live ridership deviates unexpectedly from forecast.
"""

import random
from datetime import datetime
from typing import List, Dict
from data.synthetic_gtfs import ROUTES

try:
    import numpy as np
    from sklearn.ensemble import IsolationForest
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False


_anomaly_history: Dict[str, List] = {}
_iso_models: Dict = {}


def update_and_detect(forecasts: Dict, buses: List[Dict]) -> List[Dict]:
    """
    Compare actual (simulated) ridership vs forecast.
    Return list of anomalous routes with details.
    """
    anomalies = []
    crowded_routes = {}
    
    for bus in buses:
        rid = bus.get("route_id")
        occ = bus.get("occupancy_pct", 0)
        pax = bus.get("passengers", 0)
        if rid not in crowded_routes:
            crowded_routes[rid] = {"occ": [], "pax": 0}
        crowded_routes[rid]["occ"].append(occ)
        crowded_routes[rid]["pax"] += pax

    for route in ROUTES:
        rid = route["route_id"]
        fc = forecasts.get(rid, [])
        if not fc:
            continue
            
        predicted = fc[0].get("passengers", 500) if fc else 500
        
        route_stats = crowded_routes.get(rid, {})
        occupancies = route_stats.get("occ", [50])
        avg_occ = sum(occupancies) / max(len(occupancies), 1)
        actual_passengers = route_stats.get("pax", 0)

        # Build feature history for this route
        if rid not in _anomaly_history:
            _anomaly_history[rid] = []
            
        # SYNTHETIC OVERRIDE: Randomly create massive demand spikes for demo
        if random.random() < 0.2 and len(_anomaly_history[rid]) > 2:
            actual_passengers = int(predicted * random.uniform(2.5, 4.0)) # 250% - 400% spike
            
        _anomaly_history[rid].append(actual_passengers)
        if len(_anomaly_history[rid]) > 200:
            _anomaly_history[rid].pop(0)

        # Detect anomaly
        predicted_safe = max(predicted, 1)
        deviation_pct = abs(actual_passengers - predicted_safe) / predicted_safe * 100
        anomaly_score = 0.0
        is_anomaly = False

        if SKLEARN_AVAILABLE and len(_anomaly_history[rid]) >= 3:
            import numpy as np
            hist = np.array(_anomaly_history[rid]).reshape(-1, 1)
            
            # Use cached model or train a new one every 10 ticks minimum
            train_needed = rid not in _iso_models or len(_anomaly_history[rid]) % 10 == 0
            if train_needed:
                model = IsolationForest(contamination=0.1, random_state=42)
                try:
                    model.fit(hist)
                    _iso_models[rid] = model
                except Exception:
                    pass
            else:
                model = _iso_models.get(rid)
                
            if model:
                score = model.decision_function([[actual_passengers]])[0]
                anomaly_score = -score  # higher = more anomalous
                is_anomaly = model.predict([[actual_passengers]])[0] == -1
        else:
            is_anomaly = deviation_pct > 35
            anomaly_score = deviation_pct / 100.0

        if is_anomaly or deviation_pct > 40:
            severity = "critical" if deviation_pct > 60 else "high" if deviation_pct > 40 else "medium"
            direction = "higher" if actual_passengers > predicted else "lower"
            anomalies.append({
                "route_id": rid,
                "route_name": route["route_name"],
                "route_color": route["color"],
                "severity": severity,
                "deviation_pct": round(deviation_pct, 1),
                "predicted_passengers": predicted,
                "actual_passengers": actual_passengers,
                "avg_occupancy_pct": round(avg_occ, 1),
                "direction": direction,
                "message": (
                    f"{route['route_name']}: actual ridership is {int(deviation_pct)}% {direction} than predicted. "
                    f"Predicted {predicted} passengers, seeing ~{actual_passengers}."
                ),
                "anomaly_score": round(anomaly_score, 3),
                "detected_at": datetime.now().isoformat(),
                "action_required": severity in ("critical", "high"),
            })

    anomalies.sort(key=lambda a: a["deviation_pct"], reverse=True)
    return anomalies


def get_system_health(buses: List[Dict]) -> Dict:
    """Return overall fleet health metrics."""
    total = len(buses)
    breakdown = sum(1 for b in buses if b.get("status") == "breakdown")
    delayed = sum(1 for b in buses if b.get("status") == "delayed")
    crowded = sum(1 for b in buses if b.get("occupancy_pct", 0) > 85)
    on_time = total - breakdown - delayed
    avg_occ = sum(b.get("occupancy_pct", 0) for b in buses) / max(total, 1)

    return {
        "total_buses": total,
        "on_time": on_time,
        "delayed": delayed,
        "breakdown": breakdown,
        "crowded": crowded,
        "avg_occupancy_pct": round(avg_occ, 1),
        "fleet_efficiency_pct": round((on_time / max(total, 1)) * 100, 1),
        "status": "critical" if breakdown > 5 else "warning" if delayed > 10 else "good",
    }
