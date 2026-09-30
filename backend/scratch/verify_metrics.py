from app.models.store import store
from app.algorithms.greedy import allocate_requests_greedy

store.reset_to_seed()
store.build_graph()
greedy_res = allocate_requests_greedy(store.graph, store.resources, store.requests, baseline_mode=False)
fcfs_res = allocate_requests_greedy(store.graph, store.resources, store.requests, baseline_mode=True)

print("=== GREEDY METRICS ===")
print(greedy_res['metrics'])

print("\n=== FCFS METRICS ===")
print(fcfs_res['metrics'])

print("\n=== STEP LOGS ===")
for i, s in enumerate(greedy_res['step_logs']):
    print(f"Step {i+1:02d} | Batch {s['batch_id']} | HeapBefore={s['heap_size_before_extract']} | {s['request_id']} | {s['request_type']} | Prio={s['priority_score']} | Decision={s['decision']} | Choice={s['chosen_resource']}")
