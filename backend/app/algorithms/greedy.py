# Custom Greedy & FCFS Allocation Engine with MaxHeap, Dijkstra, Cost Breakdown, and Preemption

from app.algorithms.heap import MaxHeap
from app.algorithms.config import GREEDY_CONFIG, PRIORITY_SCORES, BATCH_WINDOW
from app.algorithms.scheduler import check_slot_overlap

def compute_priority_score(req):
    """
    Computes priority score for a request.
    Base score from type + bonus for lower submission order (earlier timestamp).
    """
    req_type = req.get('type', 'club_activity')
    base = PRIORITY_SCORES.get(req_type, 10)
    sub_order = req.get('submission_time', 100)
    time_bonus = max(0, 5 - (sub_order * 0.1))
    return round(base + time_bonus, 2)

def is_resource_available(resource, day, start_slot, end_slot, current_bookings):
    """
    Checks if a resource is free during (day, start_slot, end_slot) considering current bookings.
    """
    res_id = resource['id']
    req_slot = (day, start_slot, end_slot)
    
    overlapping_bookings = []
    for b in current_bookings:
        if b['resource_id'] == res_id:
            b_slot = (b['day'], b['start_slot'], b['end_slot'])
            if check_slot_overlap(req_slot, b_slot):
                overlapping_bookings.append(b)
                
    return len(overlapping_bookings) == 0, overlapping_bookings

def allocate_requests_greedy(campus_graph, resources, requests, config=None, baseline_mode=False):
    """
    Allocation Engine:
      - baseline_mode = False (Smart Greedy with Batch Windows & MaxHeap):
          * Groups requests into arrival batches by submission_time: batch_id = (submission_time - 1) // BATCH_WINDOW.
          * For each batch, inserts all requests into a fresh MaxHeap.
          * Repeatedly extracts max priority request from MaxHeap and allocates.
          * Minimizes Greedy Cost: w1 * wasted_cap + w2 * walking_dist.
          * Supports Preemption: displaced requests are pushed back into the SAME MaxHeap (max 1 retry).
      - baseline_mode = True (Naive FCFS):
          * Processes strictly in submission_time order.
          * Ignores priority score completely.
          * Assigns the FIRST matching resource (type & capacity fit) that is free during the slot.
          * No best-fit cost optimization, no walking distance optimization, no preemption.
    """
    if config is None:
        config = GREEDY_CONFIG

    w1 = config.get("WEIGHT_WASTED_CAPACITY", 1.0)
    w2 = config.get("WEIGHT_WALKING_DISTANCE", 2.5)
    batch_window = config.get("BATCH_WINDOW", BATCH_WINDOW)

    # Calculate priority score for all requests
    req_dict_map = {}
    for r in requests:
        r_copy = dict(r)
        r_copy['priority_score'] = compute_priority_score(r_copy)
        req_dict_map[r_copy['id']] = r_copy

    bookings = []        # Active allocations
    waitlist = []        # Unallocated requests
    step_logs = []       # Stepper records
    preempted_count = 0
    retry_counts = {}

    if baseline_mode:
        # NAIVE FCFS: Process strictly by submission_time, no MaxHeap, no batching, no preemption
        pending_list = sorted([dict(r) for r in req_dict_map.values()], key=lambda x: x.get('submission_time', 0))
        while pending_list:
            req = pending_list.pop(0)
            req_id = req['id']
            req_loc = req['location']
            req_cap = req['required_capacity']
            req_type = req['resource_type']
            req_day = req['day']
            start_s = req['start_slot']
            end_s = req['end_slot']
            req_prio = req['priority_score']
            sub_time = req.get('submission_time', 0)
            batch_id = (sub_time - 1) // batch_window if sub_time > 0 else 0

            distances, paths = campus_graph.dijkstra(req_loc)
            candidates_eval = []
            best_candidate = None

            for res in resources:
                if res['type'] != req_type or res['capacity'] < req_cap:
                    continue
                res_node = res['building']
                dist = distances.get(res_node, float('inf'))
                wasted_cap = res['capacity'] - req_cap
                cost = (w1 * wasted_cap) + (w2 * dist) if dist != float('inf') else 9999
                is_free, overlaps = is_resource_available(res, req_day, start_s, end_s, bookings)
                
                eval_entry = {
                    "resource_id": res['id'],
                    "resource_name": res['name'],
                    "building": res_node,
                    "capacity": res['capacity'],
                    "wasted_capacity": wasted_cap,
                    "walking_distance": dist,
                    "path": paths.get(res_node, []),
                    "cost": round(cost, 2),
                    "is_free": is_free,
                    "overlaps": overlaps
                }
                candidates_eval.append(eval_entry)

                if is_free and best_candidate is None:
                    best_candidate = eval_entry
                    break

            step_record = {
                "batch_id": batch_id,
                "heap_size_before_extract": 0,
                "request_id": req_id,
                "requester": req['requester'],
                "request_type": req['type'],
                "priority_score": req_prio,
                "required_capacity": req_cap,
                "resource_type": req_type,
                "location": req_loc,
                "day": req_day,
                "start_slot": start_s,
                "end_slot": end_s,
                "candidates_evaluated": candidates_eval,
                "decision": None,
                "chosen_resource": None,
                "reason": ""
            }

            if best_candidate:
                booking = {
                    "id": f"bk-{req_id}",
                    "request_id": req_id,
                    "requester": req['requester'],
                    "request_type": req['type'],
                    "resource_id": best_candidate['resource_id'],
                    "resource_name": best_candidate['resource_name'],
                    "day": req_day,
                    "start_slot": start_s,
                    "end_slot": end_s,
                    "priority_score": req_prio,
                    "wasted_capacity": best_candidate['wasted_capacity'],
                    "walking_distance": best_candidate['walking_distance'],
                    "cost": best_candidate['cost'],
                    "path": best_candidate['path']
                }
                bookings.append(booking)
                step_record["decision"] = "ALLOCATED"
                step_record["chosen_resource"] = best_candidate['resource_id']
                step_record["reason"] = f"Assigned to {best_candidate['resource_name']} (Cost: {best_candidate['cost']}, wasted cap: {best_candidate['wasted_capacity']}, dist: {best_candidate['walking_distance']}m)"
            else:
                if req not in waitlist:
                    waitlist.append(req)
                step_record["decision"] = "WAITLISTED"
                step_record["reason"] = "No free resource matched criteria."

            step_logs.append(step_record)

    else:
        # SMART GREEDY: Batch Windows + MaxHeap
        # Group requests into batches by submission_time
        batch_map = {}
        for r in req_dict_map.values():
            sub_time = r.get('submission_time', 1)
            b_id = (sub_time - 1) // batch_window if sub_time > 0 else 0
            if b_id not in batch_map:
                batch_map[b_id] = []
            batch_map[b_id].append(dict(r))

        sorted_batch_ids = sorted(batch_map.keys())

        for b_id in sorted_batch_ids:
            batch_reqs = batch_map[b_id]
            heap = MaxHeap()
            for r in batch_reqs:
                heap.push(r)

            while not heap.is_empty():
                heap_size_before = heap.size()
                req = heap.extract_max()
                req_id = req['id']

                req_loc = req['location']
                req_cap = req['required_capacity']
                req_type = req['resource_type']
                req_day = req['day']
                start_s = req['start_slot']
                end_s = req['end_slot']
                req_prio = req['priority_score']

                distances, paths = campus_graph.dijkstra(req_loc)

                candidates_eval = []
                best_candidate = None
                best_cost = float('inf')

                for res in resources:
                    if res['type'] != req_type or res['capacity'] < req_cap:
                        continue
                    res_node = res['building']
                    dist = distances.get(res_node, float('inf'))
                    if dist == float('inf'):
                        continue

                    wasted_cap = res['capacity'] - req_cap
                    cost = (w1 * wasted_cap) + (w2 * dist)
                    path = paths.get(res_node, [])

                    is_free, overlaps = is_resource_available(res, req_day, start_s, end_s, bookings)

                    eval_entry = {
                        "resource_id": res['id'],
                        "resource_name": res['name'],
                        "building": res_node,
                        "capacity": res['capacity'],
                        "wasted_capacity": wasted_cap,
                        "walking_distance": dist,
                        "path": path,
                        "cost": round(cost, 2),
                        "is_free": is_free,
                        "overlaps": overlaps
                    }
                    candidates_eval.append(eval_entry)

                    if is_free and cost < best_cost:
                        best_cost = cost
                        best_candidate = eval_entry

                step_record = {
                    "batch_id": b_id,
                    "heap_size_before_extract": heap_size_before,
                    "request_id": req_id,
                    "requester": req['requester'],
                    "request_type": req['type'],
                    "priority_score": req_prio,
                    "required_capacity": req_cap,
                    "resource_type": req_type,
                    "location": req_loc,
                    "day": req_day,
                    "start_slot": start_s,
                    "end_slot": end_s,
                    "candidates_evaluated": candidates_eval,
                    "decision": None,
                    "chosen_resource": None,
                    "reason": ""
                }

                if best_candidate:
                    booking = {
                        "id": f"bk-{req_id}",
                        "request_id": req_id,
                        "requester": req['requester'],
                        "request_type": req['type'],
                        "resource_id": best_candidate['resource_id'],
                        "resource_name": best_candidate['resource_name'],
                        "day": req_day,
                        "start_slot": start_s,
                        "end_slot": end_s,
                        "priority_score": req_prio,
                        "wasted_capacity": best_candidate['wasted_capacity'],
                        "walking_distance": best_candidate['walking_distance'],
                        "cost": best_candidate['cost'],
                        "path": best_candidate['path']
                    }
                    bookings.append(booking)
                    step_record["decision"] = "ALLOCATED"
                    step_record["chosen_resource"] = best_candidate['resource_id']
                    step_record["reason"] = f"Assigned to {best_candidate['resource_name']} (Cost: {best_candidate['cost']}, wasted cap: {best_candidate['wasted_capacity']}, dist: {best_candidate['walking_distance']}m)"
                else:
                    # Check for Preemption
                    preempted_success = False
                    occupied_candidates = [c for c in candidates_eval if not c['is_free']]
                    occupied_candidates.sort(key=lambda c: c['cost'])

                    for cand in occupied_candidates:
                        overlaps = cand['overlaps']
                        can_preempt = all(b['priority_score'] < req_prio for b in overlaps)
                        if can_preempt and overlaps:
                            preempted_success = True
                            displaced_names = []
                            for b in overlaps:
                                bookings.remove(b)
                                displaced_req = req_dict_map[b['request_id']]
                                if displaced_req not in waitlist:
                                    waitlist.append(displaced_req)
                                # Push displaced request back into the SAME MaxHeap if retried < 1
                                if retry_counts.get(displaced_req['id'], 0) < 1:
                                    retry_counts[displaced_req['id']] = retry_counts.get(displaced_req['id'], 0) + 1
                                    heap.push(displaced_req)
                                displaced_names.append(f"{displaced_req['requester']} ({int(b['priority_score'])})")

                            preempted_count += len(overlaps)
                            
                            booking = {
                                "id": f"bk-{req_id}",
                                "request_id": req_id,
                                "requester": req['requester'],
                                "request_type": req['type'],
                                "resource_id": cand['resource_id'],
                                "resource_name": cand['resource_name'],
                                "day": req_day,
                                "start_slot": start_s,
                                "end_slot": end_s,
                                "priority_score": req_prio,
                                "wasted_capacity": cand['wasted_capacity'],
                                "walking_distance": cand['walking_distance'],
                                "cost": cand['cost'],
                                "path": cand['path']
                            }
                            bookings.append(booking)
                            step_record["decision"] = "PREEMPTED"
                            step_record["chosen_resource"] = cand['resource_id']
                            step_record["reason"] = f"{req['requester']} ({int(req_prio)}) preempted {', '.join(displaced_names)} on {cand['resource_name']}, {req_day} {start_s}:00-{end_s}:00"
                            break

                    if not preempted_success:
                        if req not in waitlist:
                            waitlist.append(req)
                        step_record["decision"] = "WAITLISTED"
                        step_record["reason"] = "No free resource matched criteria and no occupied slots could be preempted."

                step_logs.append(step_record)

    # Clean up waitlist so it only contains requests that remain unallocated
    allocated_req_ids = {b['request_id'] for b in bookings}
    final_waitlist = [r for r in waitlist if r['id'] not in allocated_req_ids]

    # Compute Summary Metrics
    total_reqs = len(requests)
    allocated_count = len(bookings)
    rejected_count = len(final_waitlist)
    
    high_prio_allocated = sum(1 for b in bookings if b['request_type'] in ['exam', 'regular_class'])
    total_high_prio = sum(1 for r in requests if r['type'] in ['exam', 'regular_class'])

    avg_walking_dist = round(sum(b['walking_distance'] for b in bookings) / allocated_count, 2) if allocated_count > 0 else 0
    avg_wasted_cap = round(sum(b['wasted_capacity'] for b in bookings) / allocated_count, 2) if allocated_count > 0 else 0
    utilization_pct = round((allocated_count / total_reqs) * 100, 2) if total_reqs > 0 else 0

    return {
        "bookings": bookings,
        "waitlist": final_waitlist,
        "step_logs": step_logs,
        "metrics": {
            "total_requests": total_reqs,
            "allocated_count": allocated_count,
            "rejected_count": rejected_count,
            "preempted_count": preempted_count,
            "high_prio_allocated": high_prio_allocated,
            "total_high_prio": total_high_prio,
            "utilization_pct": utilization_pct,
            "avg_walking_distance": avg_walking_dist,
            "avg_wasted_capacity": avg_wasted_cap
        }
    }
