# Custom Greedy Interval Scheduling Engine
# Resolves time-slot conflicts on the same resource using Earliest Finish Time First strategy.

def check_slot_overlap(slot1, slot2):
    """
    slot1, slot2 are tuples of (day, start_slot, end_slot).
    Returns True if both slots share the same day and have an overlapping time interval.
    """
    day1, start1, end1 = slot1
    day2, start2, end2 = slot2
    if day1 != day2:
        return False
    return max(start1, start2) < min(end1, end2)

def interval_scheduling_greedy(requests_list):
    """
    Greedy Interval Scheduling: Earliest Finish Time First.
    Given a list of request dicts competing for a single resource on a day,
    sorts by end_slot and selects maximum non-overlapping set.
    
    Each item in requests_list must have 'start_slot' and 'end_slot'.
    Returns list of accepted request ids.
    """
    # Sort by end_slot ascending
    sorted_reqs = sorted(requests_list, key=lambda x: (x['day'], x['end_slot']))
    accepted = []
    last_end_by_day = {}

    for req in sorted_reqs:
        day = req['day']
        start = req['start_slot']
        end = req['end_slot']

        if day not in last_end_by_day or start >= last_end_by_day[day]:
            accepted.append(req['id'])
            last_end_by_day[day] = end

    return accepted
