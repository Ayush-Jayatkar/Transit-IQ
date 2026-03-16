"""
Bus Bunching Detector — Transit-IQ Round 3
==========================================
Detects when two buses on the same route are within 600 m of each other.
"""
import math


def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Return distance in metres between two GPS coordinates."""
    R = 6_371_000  # Earth radius in metres
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


def detect_bunching(buses: list, threshold_m: int = 600) -> list:
    """
    Group buses by route, find pairs within threshold_m metres of each other.

    Returns a list of dicts:
        {route_id, route_name, bus1_id, bus2_id, lat, lon, distance_m, severity}
    """
    from collections import defaultdict
    by_route: dict = defaultdict(list)
    for b in buses:
        if b.get("status") != "breakdown":  # skip broken-down buses
            by_route[b["route_id"]].append(b)

    events = []
    for route_id, route_buses in by_route.items():
        for i in range(len(route_buses)):
            for j in range(i + 1, len(route_buses)):
                b1, b2 = route_buses[i], route_buses[j]
                dist = haversine(b1["lat"], b1["lon"], b2["lat"], b2["lon"])
                if dist <= threshold_m:
                    # Mid-point for map marker
                    mid_lat = (b1["lat"] + b2["lat"]) / 2
                    mid_lon = (b1["lon"] + b2["lon"]) / 2
                    severity = "critical" if dist < 200 else "high" if dist < 400 else "medium"
                    events.append({
                        "route_id": route_id,
                        "route_name": b1.get("route_name", route_id),
                        "bus1_id": b1["bus_id"],
                        "bus2_id": b2["bus_id"],
                        "lat": round(mid_lat, 6),
                        "lon": round(mid_lon, 6),
                        "distance_m": round(dist),
                        "severity": severity,
                        "action": f"Hold {b2['bus_id']} at next stop for 4–6 minutes to restore spacing",
                    })
    # Sort by distance (closest = most urgent)
    events.sort(key=lambda x: x["distance_m"])
    return events
