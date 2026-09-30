# Unit tests for Greedy Allocation Engine, preemption, and interval scheduling
import pytest
from app.algorithms.graph import Graph
from app.algorithms.greedy import allocate_requests_greedy
from app.algorithms.heap import MaxHeap
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

    assert g_m["utilization_pct"] > f_m["utilization_pct"]
    assert g_m["high_prio_allocated"] > f_m["high_prio_allocated"]
    assert g_m["avg_wasted_capacity"] < f_m["avg_wasted_capacity"]
    assert g_m["avg_walking_distance"] < f_m["avg_walking_distance"]
    assert g_m["preempted_count"] >= 2
    assert g_m["rejected_count"] >= 1

def test_batch_window_same_batch_exam_before_club():
    """1. Within one batch, an Exam is extracted and allocated before a Club Activity, even if the club has the earlier submission_time."""
    g = Graph()
    g.add_node("A", "Building A")
    resources = [{"id": "CR1", "name": "Classroom 1", "type": "classroom", "capacity": 50, "building": "A"}]
    
    requests = [
        {
            "id": "REQ_CLUB",
            "requester": "Club",
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
            "requester": "Exam",
            "type": "exam",
            "required_capacity": 40,
            "resource_type": "classroom",
            "location": "A",
            "day": "Monday",
            "start_slot": 9,
            "end_slot": 11,
            "submission_time": 2
        }
    ]

    res = allocate_requests_greedy(g, resources, requests, baseline_mode=False)
    step_ids = [s["request_id"] for s in res["step_logs"]]
    
    # Exam extracted at step 1 before Club at step 2
    assert step_ids[0] == "REQ_EXAM"
    assert step_ids[1] == "REQ_CLUB"
    assert res["bookings"][0]["request_id"] == "REQ_EXAM"

def test_across_batches_later_exam_preempts_earlier_club():
    """2. Across batches, a later exam preempts an earlier club booking, and the displaced request is retried."""
    g = Graph()
    g.add_node("A", "Building A")
    resources = [{"id": "CR1", "name": "Classroom 1", "type": "classroom", "capacity": 50, "building": "A"}]
    
    requests = [
        {
            "id": "REQ_CLUB",
            "requester": "Club",
            "type": "club_activity",
            "required_capacity": 30,
            "resource_type": "classroom",
            "location": "A",
            "day": "Monday",
            "start_slot": 9,
            "end_slot": 11,
            "submission_time": 1  # Batch 0
        },
        {
            "id": "REQ_EXAM",
            "requester": "Exam",
            "type": "exam",
            "required_capacity": 40,
            "resource_type": "classroom",
            "location": "A",
            "day": "Monday",
            "start_slot": 9,
            "end_slot": 11,
            "submission_time": 6  # Batch 1
        }
    ]

    res = allocate_requests_greedy(g, resources, requests, baseline_mode=False)
    
    # Check that Exam preempted Club
    preempt_steps = [s for s in res["step_logs"] if s["decision"] == "PREEMPTED"]
    assert len(preempt_steps) == 1
    assert preempt_steps[0]["request_id"] == "REQ_EXAM"
    
    # Check that displaced REQ_CLUB retried (produced a step log in batch 1)
    retried_steps = [s for s in res["step_logs"] if s["request_id"] == "REQ_CLUB"]
    assert len(retried_steps) == 2

def test_waitlist_after_failed_retry():
    """3. Waitlist after failed retry."""
    g = Graph()
    g.add_node("A", "Building A")
    resources = [{"id": "CR1", "name": "Classroom 1", "type": "classroom", "capacity": 50, "building": "A"}]
    
    requests = [
        {
            "id": "REQ_CLUB",
            "requester": "Club",
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
            "requester": "Exam",
            "type": "exam",
            "required_capacity": 40,
            "resource_type": "classroom",
            "location": "A",
            "day": "Monday",
            "start_slot": 9,
            "end_slot": 11,
            "submission_time": 6
        }
    ]

    res = allocate_requests_greedy(g, resources, requests, baseline_mode=False)
    
    # REQ_CLUB is retried but fails because CR1 is taken by REQ_EXAM, ending up in waitlist
    waitlisted_ids = [w["id"] for w in res["waitlist"]]
    assert "REQ_CLUB" in waitlisted_ids

def test_fcfs_baseline_strictly_submission_order():
    """4. FCFS baseline still processes strictly in submission order."""
    g = Graph()
    g.add_node("A", "Building A")
    resources = [
        {"id": "CR1", "name": "Classroom 1", "type": "classroom", "capacity": 50, "building": "A"},
        {"id": "CR2", "name": "Classroom 2", "type": "classroom", "capacity": 50, "building": "A"}
    ]
    
    requests = [
        {
            "id": "REQ_CLUB",
            "requester": "Club",
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
            "requester": "Exam",
            "type": "exam",
            "required_capacity": 40,
            "resource_type": "classroom",
            "location": "A",
            "day": "Monday",
            "start_slot": 9,
            "end_slot": 11,
            "submission_time": 2
        }
    ]

    res = allocate_requests_greedy(g, resources, requests, baseline_mode=True)
    step_ids = [s["request_id"] for s in res["step_logs"]]
    
    # FCFS processes strictly by submission_time: REQ_CLUB first, then REQ_EXAM
    assert step_ids == ["REQ_CLUB", "REQ_EXAM"]

def test_maxheap_extract_max_called_once_per_processed_step(monkeypatch):
    """5. A test that MaxHeap.extract_max is called once per processed step."""
    extract_count = 0
    original_extract_max = MaxHeap.extract_max

    def counting_extract_max(self):
        nonlocal extract_count
        extract_count += 1
        return original_extract_max(self)

    monkeypatch.setattr(MaxHeap, "extract_max", counting_extract_max)

    g = Graph()
    for n in SEED_NODES:
        g.add_node(n["id"], n["name"])
    for e in SEED_EDGES:
        g.add_edge(e["u"], e["v"], e["weight"])

    res = allocate_requests_greedy(g, SEED_RESOURCES, SEED_REQUESTS, baseline_mode=False)
    
    total_steps = len(res["step_logs"])
    assert extract_count == total_steps
