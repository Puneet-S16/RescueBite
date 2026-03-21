import math
from datetime import datetime

def calculate_heat_score(required: int, fulfilled: int, urgency_level: str, created_at: datetime) -> float:
    unmet_demand = required - fulfilled
    if unmet_demand <= 0:
        return 0.0
    
    urgency_weight = 1.0
    if urgency_level.lower() == "high":
        urgency_weight = 3.0
    elif urgency_level.lower() == "medium":
        urgency_weight = 2.0
    
    # Time factor increases slightly as the request ages (unmet for longer = hotter)
    hours_elapsed = (datetime.utcnow() - created_at).total_seconds() / 3600
    time_factor = 1.0 + (hours_elapsed * 0.1)
    
    return unmet_demand * urgency_weight * time_factor

def calculate_priority(quantity: int, expiry_time: int) -> float:
    # Basic sorting for donations based strictly on food quantity and expiry urgency
    urgency_factor = 1.0
    if expiry_time <= 2:
        urgency_factor = 3.0
    elif expiry_time <= 5:
        urgency_factor = 2.0
    elif expiry_time <= 12:
        urgency_factor = 1.5
    
    return quantity * urgency_factor

def sort_donations_by_priority(donations):
    sorted_donations = []
    for donation in donations:
        score = calculate_priority(donation.quantity, donation.expiry_time)
        sorted_donations.append({"donation": donation, "score": score})
    sorted_donations.sort(key=lambda x: x["score"], reverse=True)
    return [item["donation"] for item in sorted_donations]

def auto_assign_ngo(donation_latitude: float, donation_longitude: float, active_requests):
    best_request = None
    highest_score = -1
    
    for req in active_requests:
        unmet_demand = req.required_quantity - req.fulfilled_quantity
        if unmet_demand <= 0:
            continue
            
        # Standard heat score covers urgency and unmet demand
        base_score = calculate_heat_score(req.required_quantity, req.fulfilled_quantity, req.urgency_level, req.created_at)
        
        # Calculate distance (simplified euclidean)
        dist = math.hypot(req.latitude - donation_latitude, req.longitude - donation_longitude)
        # Closer = better, so subtract distance or divide by it. Adding 1 to avoid ZeroDivision
        final_score = base_score / (dist + 1)
        
        if final_score > highest_score:
            highest_score = final_score
            best_request = req
            
    return best_request
