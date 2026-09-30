# Unit tests for custom MaxHeap and MinHeap data structures
import pytest
from app.algorithms.heap import MaxHeap, MinHeap

def test_max_heap_basic():
    heap = MaxHeap()
    heap.push({"id": "R1", "priority_score": 30, "submission_time": 1})
    heap.push({"id": "R2", "priority_score": 50, "submission_time": 2})
    heap.push({"id": "R3", "priority_score": 40, "submission_time": 3})

    assert heap.peek()["id"] == "R2"
    assert heap.extract_max()["id"] == "R2"
    assert heap.extract_max()["id"] == "R3"
    assert heap.extract_max()["id"] == "R1"
    assert heap.is_empty() is True

def test_max_heap_tie_breaker():
    heap = MaxHeap()
    # Same priority_score, R1 submitted earlier (submission_time=1) vs R2 (submission_time=2)
    heap.push({"id": "R2", "priority_score": 40, "submission_time": 2})
    heap.push({"id": "R1", "priority_score": 40, "submission_time": 1})

    assert heap.extract_max()["id"] == "R1"
    assert heap.extract_max()["id"] == "R2"

def test_min_heap_basic():
    heap = MinHeap()
    heap.push(15.5, "NodeB")
    heap.push(5.0, "NodeA")
    heap.push(20.0, "NodeC")

    assert heap.extract_min() == (5.0, "NodeA")
    assert heap.extract_min() == (15.5, "NodeB")
    assert heap.extract_min() == (20.0, "NodeC")
    assert heap.is_empty() is True
