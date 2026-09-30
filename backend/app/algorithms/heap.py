# Custom Heap Priority Queue Module
# Implements MaxHeap (for pending requests queue) and MinHeap (for Dijkstra's shortest path) from scratch.

class MaxHeap:
    """
    Max-Heap priority queue holding pending requests.
    Items are tuples/dicts or objects compared by request priority score (descending),
    with submission timestamp tie-breaker (earlier submission = higher priority).
    """
    def __init__(self):
        self.heap = []

    def _priority_key(self, item):
        # Priority score numeric value primary, minus submission order (so lower submission order = higher tie-break)
        # item is assumed to be dict with 'priority_score' and 'submission_time' or 'id'
        score = item.get('priority_score', 0)
        sub_time = item.get('submission_time', 0)
        return (score, -sub_time)

    def push(self, item):
        self.heap.append(item)
        self._sift_up(len(self.heap) - 1)

    def extract_max(self):
        if not self.heap:
            return None
        if len(self.heap) == 1:
            return self.heap.pop()
        
        max_item = self.heap[0]
        self.heap[0] = self.heap.pop()
        self._sift_down(0)
        return max_item

    def peek(self):
        return self.heap[0] if self.heap else None

    def is_empty(self):
        return len(self.heap) == 0

    def size(self):
        return len(self.heap)

    def _sift_up(self, index):
        parent = (index - 1) // 2
        while index > 0 and self._priority_key(self.heap[index]) > self._priority_key(self.heap[parent]):
            self.heap[index], self.heap[parent] = self.heap[parent], self.heap[index]
            index = parent
            parent = (index - 1) // 2

    def _sift_down(self, index):
        size = len(self.heap)
        while True:
            left = 2 * index + 1
            right = 2 * index + 2
            largest = index

            if left < size and self._priority_key(self.heap[left]) > self._priority_key(self.heap[largest]):
                largest = left
            if right < size and self._priority_key(self.heap[right]) > self._priority_key(self.heap[largest]):
                largest = right

            if largest != index:
                self.heap[index], self.heap[largest] = self.heap[largest], self.heap[index]
                index = largest
            else:
                break

    def heapify(self, arr):
        self.heap = list(arr)
        for i in range(len(self.heap) // 2 - 1, -1, -1):
            self._sift_down(i)


class MinHeap:
    """
    Min-Heap priority queue used inside Dijkstra's algorithm.
    Stores tuples of (distance, node_id).
    """
    def __init__(self):
        self.heap = []

    def push(self, distance, node_id):
        item = (distance, node_id)
        self.heap.append(item)
        self._sift_up(len(self.heap) - 1)

    def extract_min(self):
        if not self.heap:
            return None
        if len(self.heap) == 1:
            return self.heap.pop()

        min_item = self.heap[0]
        self.heap[0] = self.heap.pop()
        self._sift_down(0)
        return min_item

    def is_empty(self):
        return len(self.heap) == 0

    def _sift_up(self, index):
        parent = (index - 1) // 2
        while index > 0 and self.heap[index][0] < self.heap[parent][0]:
            self.heap[index], self.heap[parent] = self.heap[parent], self.heap[index]
            index = parent
            parent = (index - 1) // 2

    def _sift_down(self, index):
        size = len(self.heap)
        while True:
            left = 2 * index + 1
            right = 2 * index + 2
            smallest = index

            if left < size and self.heap[left][0] < self.heap[smallest][0]:
                smallest = left
            if right < size and self.heap[right][0] < self.heap[smallest][0]:
                smallest = right

            if smallest != index:
                self.heap[index], self.heap[smallest] = self.heap[smallest], self.heap[index]
                index = smallest
            else:
                break
