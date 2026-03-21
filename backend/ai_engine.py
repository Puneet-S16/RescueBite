def calculate_priority(quantity: int, expiry_time: int, hunger_level: str) -> float:
    # Urgency Factor depends on expiry time (inverse relationship: lower time = higher urgency)
    urgency_factor = 1.0
    if expiry_time <= 2:
        urgency_factor = 3.0
    elif expiry_time <= 5:
        urgency_factor = 2.0
    elif expiry_time <= 12:
        urgency_factor = 1.5
    else:
        urgency_factor = 1.0

    # Hunger Level Weight
    hunger_weight = 1.0
    if hunger_level.lower() == "high":
        hunger_weight = 3.0
    elif hunger_level.lower() == "medium":
        hunger_weight = 2.0
    else:
        hunger_weight = 1.0

    # Priority Score = (Quantity * Urgency Factor) + (10 * Hunger Level Weight) 
    # Adjusting weight so they balance well. Heatmap is crucial.
    priority_score = (quantity * urgency_factor) + (20 * hunger_weight)
    return priority_score

def sort_donations_by_priority(donations, heatmap_zones):
    # Simple nearest mapping for this MVP is to just pick a heatmap zone / default
    # But for MVP, if we don't have exact mapping, we just use a default
    sorted_donations = []
    for donation in donations:
        # For simplicity, assign a default hunger level or find nearest if we had coordinates matching
        # Assuming we just use a high urgency for demonstration or nearest calculation
        hunger_level = "high" # default
        for zone in heatmap_zones:
            # Just matching rough latitude/longitude (simplified)
            if round(zone.latitude, 1) == round(donation.latitude, 1) and round(zone.longitude, 1) == round(donation.longitude, 1):
                hunger_level = zone.hunger_level
                break
        
        score = calculate_priority(donation.quantity, donation.expiry_time, hunger_level)
        sorted_donations.append({"donation": donation, "score": score})
    
    sorted_donations.sort(key=lambda x: x["score"], reverse=True)
    return [item["donation"] for item in sorted_donations]
