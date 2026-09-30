# In-memory store initialized with seed data
from app.seed import SEED_NODES, SEED_EDGES, SEED_RESOURCES, SEED_REQUESTS
from app.algorithms.graph import Graph
from app.algorithms.config import GREEDY_CONFIG

class DataStore:
    def __init__(self):
        self.reset_to_seed()

    def reset_to_seed(self):
        self.nodes = [dict(n) for n in SEED_NODES]
        self.edges = [dict(e) for e in SEED_EDGES]
        self.resources = [dict(r) for r in SEED_RESOURCES]
        self.requests = [dict(rq) for rq in SEED_REQUESTS]
        self.config = dict(GREEDY_CONFIG)
        self.build_graph()

    def build_graph(self):
        self.graph = Graph()
        for node in self.nodes:
            self.graph.add_node(node["id"], node.get("name", node["id"]))
        for edge in self.edges:
            self.graph.add_edge(edge["u"], edge["v"], edge["weight"])

store = DataStore()
