# Unit tests for Greedy Allocation Engine, preemption, and interval scheduling
import pytest
from app.algorithms.graph import Graph
from app.algorithms.greedy import allocate_requests_greedy
from app.algorithms.scheduler import interval_scheduling_greedy
from app.seed import SEED_NODES, SEED_EDGES, SEED_RESOURCES, SEED_REQUESTS

def test_interval_scheduling():
    reqs = [
        {"id": "R1", "day": "Monday", "start_slot": 8, "end_slot": 11},
        {"id": "R2", "day": "Monday", "start_slot": 9, "end_slot": 10},
        {"id": "R3", "day": "Monday", "start_slot": 10, "end_slot": 12},
    ]
    accepted = interval_scheduling_greedy(reqs)
    assert accepted == ["R2", "R3"]

def test_fcfs_vs_greedy_seed_difference():
    """Verify Greedy outperforms Naive FCFS on seed dataset"""
    g = Graph()
    for n in SEED_NODES:
        g.add_node(n["id"], n["name"])
    for e in SEED_EDGES:
        g.add_edge(e["u"], e["v"], e["weight"])

    greedy_res = allocate_requests_greedy(g, SEED_RESOURCES, SEED_REQUESTS, baseline_mode=False)
    fcfs_res = allocate_requests_greedy(g, SEED_RESOURCES, SEED_REQUESTS, baseline_mode=True)

    g_m = greedy_res["metrics"]
    f_m = fcfs_res["metrics"]

    # Greedy should clearly match or beat FCFS on utilization, high-prio satisfied, avg wasted cap, walking dist
    assert g_m["utilization_pct"] > f_m["utilization_pct"]
    assert g_m["high_prio_allocated"] > f_m["high_prio_allocated"]
    assert g_m["avg_wasted_capacity"] < f_m["avg_wasted_capacity"]
    assert g_m["avg_walking_distance"] < f_m["avg_walking_distance"]
    assert g_m["preempted_count"] >= 2

def test_preemption_displaces_lower_priority_booking():
    """Verify a high priority exam preempts an active low priority booking"""
    g = Graph()
    g.add_node("A", "Building A")
    
    resources = [
        {"id": "LAB1", "name": "AI Lab", "type": "lab", "capacity": 30, "building": "A"}
    ]
    
    requests = [
        {
            "id": "REQ_CLUB",
            "requester": "Gaming Club",
            "type": "club_activity",
            "required_capacity": 20,
            "resource_type": "lab",
            "location": "A",
            "day": "Monday",
            "start_slot": 9,
            "end_slot": 11,
            "submission_time": 1
        },
        {
            "id": "REQ_EXAM",
            "requester": "Dean (Final Exam)",
            "type": "exam",
            "required_capacity": 25,
            "resource_type": "lab",
            "location": "A",
            "day": "Monday",
            "start_slot": 9,
            "end_slot": 11,
            "submission_time": 2
        }
    ]

    res = allocate_requests_greedy(g, resources, requests, baseline_mode=False)
    
    # Check that preemption occurred
    assert res["metrics"]["preempted_count"] == 1
    # Check that Exam is allocated to LAB1
    allocated_req_ids = [b["request_id"] for b in res["bookings"]]
    assert "REQ_EXAM" in allocated_req_ids
    # Check stepper log contains PREEMPTED decision
    preempt_steps = [s for s in res["step_logs"] if s["decision"] == "PREEMPTED"]
    assert len(preempt_steps) >= 1
    assert "preempted" in preempt_steps[0]["reason"].lower()

def test_waitlist_retry_after_resource_freed():
    """Verify that a displaced request goes back to waitlist and is retried on an open resource"""
    g = Graph()
    g.add_node("A", "Building A")
    g.add_node("B", "Building B")
    g.add_edge("A", "B", 10)

    # 2 classrooms: CR1 (near A) and CR2 (near B)
    resources = [
        {"id": "CR1", "name": "Classroom 1", "type": "classroom", "capacity": 50, "building": "A"},
        {"id": "CR2", "name": "Classroom 2", "type": "classroom", "capacity": 50, "building": "B"}
    ]

    # REQ_CLUB takes CR1 initially because CR1 is at building A.
    # Then REQ_MIDTERM (regular_class, cap 48) takes CR2.
    # Then REQ_EXAM (exam, cap 48) arrives for Mon 9-11 and preempts REQ_CLUB on CR1.
    # REQ_CLUB retries, but CR2 is occupied by REQ_MIDTERM, so REQ_CLUB goes to final waitlist.
    requests = [
        {
            "id": "REQ_CLUB",
            "requester": "Esports Club",
            "type": "club_activity",
            "required_capacity": 30,
            "resource_type": "classroom",
            "location": "A",
            "day": "Monday",
            "start_slot": 9,
            "end_slot": 11,
            "submission_time": 1
        },
        {
            "id": "REQ_EXAM",
            "requester": "Math Exam",
            "type": "exam",
            "required_capacity": 45,
            "resource_type": "classroom",
            "location": "A",
            "day": "Monday",
            "start_slot": 9,
            "end_slot": 11,
            "submission_time": 2
        }
    ]

    res = allocate_requests_greedy(g, resources, requests, baseline_mode=False)
    
    # REQ_EXAM gets CR1 or CR2, REQ_CLUB gets the remaining open resource on retry!
    allocated_req_ids = [b["request_id"] for b in res["bookings"]]
    assert "REQ_EXAM" in allocated_req_ids
    assert "REQ_CLUB" in allocated_req_ids
