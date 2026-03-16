import math

EVENTS = [
    {
        "event_name": "Ganpati Festival",
        "location": "Dagdusheth Temple",
        "lat": 18.5164,
        "lon": 73.8567,
        "start_hour": 0,
        "end_hour": 24,
        "demand_multiplier": 1.55
    },
    {
        "event_name": "IPL Match",
        "location": "MCA Stadium",
        "lat": 18.6742,
        "lon": 73.7457,
        "start_hour": 0,
        "end_hour": 24,
        "demand_multiplier": 1.9
    },
    {
        "event_name": "Concert",
        "location": "Balewadi Stadium",
        "lat": 18.5703,
        "lon": 73.7745,
        "start_hour": 0,
        "end_hour": 24,
        "demand_multiplier": 1.7
    },
    {
        "event_name": "Heavy Rain",
        "location": "Pune City",
        "lat": 18.5204,
        "lon": 73.8567,
        "start_hour": 0,
        "end_hour": 24,
        "demand_multiplier": 1.35
    }
]

def get_active_events(current_hour: int, forecasts: dict) -> list:
    """
    Returns active events for the given hour and calculates extra buses needed.
    """
    BUS_CAPACITY = 80
    active_events = []
    
    # Calculate base expected demand across all forecasted routes to base the multiplier on
    # In a real system this would map routes geometrically to the event. For this demo,
    # we take a simple max or average to represent the "surrounding area demand".
    max_forecast_pax = 0
    for route_id, fc_list in forecasts.items():
        if fc_list:
            max_forecast_pax = max(max_forecast_pax, fc_list[0].get("passengers", 0))
            
    if max_forecast_pax == 0:
        max_forecast_pax = 500  # Fallback if forecasts aren't ready
        
    for ev in EVENTS:
        if ev["start_hour"] <= current_hour <= ev["end_hour"]:
            mult = ev["demand_multiplier"]
            diff = (max_forecast_pax * mult) - max_forecast_pax
            extra_buses = math.ceil(diff / BUS_CAPACITY)
            
            event_data = {**ev, "extra_buses_needed": max(1, extra_buses)}
            active_events.append(event_data)
            
    return active_events
