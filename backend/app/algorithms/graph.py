# Custom Graph Implementation with Adjacency List, BFS, DFS, and Dijkstra algorithm
from app.algorithms.heap import MinHeap

class Graph:
    """
    Weighted undirected graph modeling campus nodes (buildings/locations) and walking distance edges.
    """
    def __init__(self):
        self.adj = {}  # node_id -> list of (neighbor_id, weight)
        self.nodes = {} # node_id -> node properties dict (e.g. name)

    def add_node(self, node_id, name=""):
        if node_id not in self.adj:
            self.adj[node_id] = []
            self.nodes[node_id] = {"id": node_id, "name": name or node_id}

    def add_edge(self, u, v, weight):
        self.add_node(u)
        self.add_node(v)
        # Check if edge already exists, update weight if so
        for i, (neigh, w) in enumerate(self.adj[u]):
            if neigh == v:
                self.adj[u][i] = (v, weight)
                break
        else:
            self.adj[u].append((v, weight))

        for i, (neigh, w) in enumerate(self.adj[v]):
            if neigh == u:
                self.adj[v][i] = (u, weight)
                break
        else:
            self.adj[v].append((u, weight))

    def bfs(self, start_node):
        """Returns set of reachable nodes from start_node using BFS."""
        if start_node not in self.adj:
            return set()
        visited = {start_node}
        queue = [start_node]
        while queue:
            curr = queue.pop(0)
            for neighbor, _ in self.adj.get(curr, []):
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
        return visited

    def dfs(self, start_node):
        """Returns set of reachable nodes from start_node using DFS."""
        if start_node not in self.adj:
            return set()
        visited = set()
        stack = [start_node]
        while stack:
            curr = stack.pop()
            if curr not in visited:
                visited.add(curr)
                for neighbor, _ in self.adj.get(curr, []):
                    if neighbor not in visited:
                        stack.append(neighbor)
        return visited

    def dijkstra(self, start_node):
        """
        Computes shortest distances and paths from start_node to all reachable nodes
        using custom MinHeap.
        Returns:
            distances: dict mapping node_id -> shortest_distance (float('inf') if unreachable)
            paths: dict mapping node_id -> list of node_ids forming the path from start_node
        """
        distances = {node: float('inf') for node in self.adj}
        predecessors = {node: None for node in self.adj}
        
        if start_node not in self.adj:
            return distances, {}

        distances[start_node] = 0
        min_heap = MinHeap()
        min_heap.push(0, start_node)

        visited = set()

        while not min_heap.is_empty():
            current_dist, u = min_heap.extract_min()

            if u in visited:
                continue
            visited.add(u)

            for neighbor, weight in self.adj.get(u, []):
                if neighbor in visited:
                    continue
                distance = current_dist + weight
                if distance < distances[neighbor]:
                    distances[neighbor] = distance
                    predecessors[neighbor] = u
                    min_heap.push(distance, neighbor)

        # Reconstruct paths
        paths = {}
        for target_node in self.adj:
            if distances[target_node] == float('inf'):
                paths[target_node] = []
            else:
                path = []
                curr = target_node
                while curr is not None:
                    path.append(curr)
                    curr = predecessors[curr]
                path.reverse()
                paths[target_node] = path

        return distances, paths
