# Smart Campus Resource Allocation System

A full-stack web application that allocates campus resources (classrooms, labs, seminar halls, equipment) to incoming requests using custom-built Data Structures and Algorithms (**Graph**, **Max-Heap**, **Min-Heap**, and **Greedy Algorithms** with **Preemption** and **Interval Scheduling**) implemented completely from scratch in Python without external DSA libraries like `heapq` or `networkx`.

---

## 🛠️ Data Structures & Algorithms

All core algorithms are located in `backend/app/algorithms/`:

1. **MaxHeap Priority Queue** (`heap.py`):
   - Array-based binary Max-Heap holding pending resource requests ordered by priority score (`exam` > `regular_class` > `faculty_meeting` > `event` > `club_activity`).
   - Tie-breaker: earlier submission timestamp receives higher priority.
2. **MinHeap Priority Queue** (`heap.py`):
   - Array-based binary Min-Heap used exclusively inside Dijkstra's algorithm to extract the unvisited node with minimum tentative distance.
3. **Graph Data Structure & Shortest Path** (`graph.py`):
   - Weighted undirected graph stored using an Adjacency List.
   - Includes custom `bfs()` and `dfs()` for connectivity verification.
   - Custom `dijkstra(start_node)` using `MinHeap` to calculate shortest walking distance in meters and path from requester location to candidate resources.
4. **Multi-Objective Greedy Engine with Preemption** (`greedy.py`):
   - Repeatedly extracts highest-priority request from `MaxHeap`.
   - Filters candidate resources matching resource type & capacity requirements.
   - Calculates candidate Greedy Cost:
     $$\text{Cost} = (w_1 \times \text{wasted\_capacity}) + (w_2 \times \text{walking\_distance})$$
   - Checks slot availability (8:00 - 18:00 fixed 1-hour slots).
   - If slot is occupied by lower-priority booking(s), executes **Preemption** to displace lower-priority bookings into the waitlist.
5. **Greedy Interval Scheduling** (`scheduler.py`):
   - Earliest Finish Time First algorithm used for resolving time-slot overlaps on resources.

---

## 📊 Time Complexity & Algorithm Analysis

| Algorithm / Component | Time Complexity | Space Complexity | Description |
| :--- | :--- | :--- | :--- |
| **Max-Heap Push / Extract-Max** | $\mathcal{O}(\log R)$ | $\mathcal{O}(R)$ | Pending request queue operations ($R$ = requests count) |
| **Max-Heap Heapify** | $\mathcal{O}(R)$ | $\mathcal{O}(R)$ | Build Max-Heap priority queue from array |
| **Min-Heap Push / Extract-Min** | $\mathcal{O}(\log V)$ | $\mathcal{O}(V)$ | Min-heap operations during Dijkstra ($V$ = campus nodes) |
| **Dijkstra Shortest Path** | $\mathcal{O}((V + E) \log V)$ | $\mathcal{O}(V + E)$ | Walking distance calculation from requester node ($E$ = edges) |
| **BFS / DFS Reachability** | $\mathcal{O}(V + E)$ | $\mathcal{O}(V)$ | Connectivity traversal |
| **Greedy Request Allocator** | $\mathcal{O}(R \cdot ( (V+E)\log V + K \cdot B ) )$ | $\mathcal{O}(R + B)$ | Allocates $R$ requests evaluating $K$ candidates against $B$ active bookings |
| **Greedy Interval Scheduler** | $\mathcal{O}(N \log N)$ | $\mathcal{O}(N)$ | Earliest Finish Time First sorting ($N$ = overlapping slots) |

### 💡 Why Greedy is (or is not) Optimal Here

- **Why Greedy is Effective**:
  - Max-Heap ordering guarantees high-urgency activities (e.g. exams) receive resource allocation priority before low-priority club meetings.
  - Multi-objective distance + capacity cost minimization locally minimizes walking fatigue and room under-utilization for each individual request.
- **Where Greedy is Sub-Optimal (Global Optimality Trade-off)**:
  - Because requests are processed sequentially based on local greedy choice, early high-priority allocations might consume a large central classroom that could have accommodated a slightly larger class later, forcing the later request into a waitlist (the classic Knapsack / Online Bin Packing trade-off).
  - Preemption partially mitigates this by allowing higher priority requests to displace lower priority ones dynamically.

---

## 🚀 Quickstart & Setup

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Run Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
python run.py
```
Backend server starts on `http://127.0.0.1:8000`. API documentation available at `http://127.0.0.1:8000/docs`.

### 2. Run Backend Unit Tests (Pytest)
```bash
cd backend
python -m pytest tests
```

### 3. Run Frontend (React + Vite + Tailwind)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://127.0.0.1:5173`.

---

## 🌐 Deployment

To run the backend in production / deployment environments, use the following start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

---

## 📈 Benchmark & Strategy Comparison Results

On the standard contested seed dataset (12 campus nodes, 11 scarce resources, 15 requests):

| Metric | Smart Greedy Engine | Naive FCFS Baseline | Improvement |
| :--- | :--- | :--- | :--- |
| **Utilization Rate** | **80.0%** (12/15) | **60.0%** (9/15) | **+20.0%** higher utilization |
| **High-Priority Requests Allocated** | **5 / 5 (100%)** | **3 / 5 (60.0%)** | **+40.0%** more exams/classes satisfied |
| **Preemption Displacements** | **5** | **0** | **5 active preemptions** |
| **Avg Walking Distance** | **129.17m** | **191.11m** | **-32.4%** shorter walking distance |
| **Avg Wasted Capacity** | **23.50 seats** | **56.11 seats** | **-58.1%** less wasted seat capacity |

---

## 💻 Tech Stack
- **Backend**: Python, FastAPI, Uvicorn, Pydantic, Pytest
- **Algorithms**: Custom Graph, MaxHeap, MinHeap, Dijkstra, Greedy Engine (No external DSA libraries)
- **Frontend**: React, Vite, Tailwind CSS, Vis-Network, Lucide Icons
- **Storage**: In-Memory Store initialized with JSON Seed data (12 nodes, 11 resources, 15 requests)

