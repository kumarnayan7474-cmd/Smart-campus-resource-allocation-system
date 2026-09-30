# Unit tests for Graph adjacency list, BFS, DFS, and MinHeap Dijkstra
import pytest
from app.algorithms.graph import Graph

def build_sample_graph():
    g = Graph()
    # Nodes: A, B, C, D, E
    # Edges: A-B (5), B-C (10), A-C (20), C-D (2), D-E (4)
    g.add_edge("A", "B", 5)
    g.add_edge("B", "C", 10)
    g.add_edge("A", "C", 20)
    g.add_edge("C", "D", 2)
    g.add_edge("D", "E", 4)
    return g

def test_graph_bfs_dfs():
    g = build_sample_graph()
    visited_bfs = g.bfs("A")
    visited_dfs = g.dfs("A")

    assert visited_bfs == {"A", "B", "C", "D", "E"}
    assert visited_dfs == {"A", "B", "C", "D", "E"}

def test_dijkstra_shortest_paths():
    g = build_sample_graph()
    distances, paths = g.dijkstra("A")

    # A -> B is 5
    assert distances["B"] == 5
    assert paths["B"] == ["A", "B"]

    # A -> C via B is 5 + 10 = 15 (shorter than direct edge 20)
    assert distances["C"] == 15
    assert paths["C"] == ["A", "B", "C"]

    # A -> E via A-B-C-D-E is 5 + 10 + 2 + 4 = 21
    assert distances["E"] == 21
    assert paths["E"] == ["A", "B", "C", "D", "E"]
