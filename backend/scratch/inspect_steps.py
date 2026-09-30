from app.models.store import store
from app.algorithms.greedy import allocate_requests_greedy

store.reset_to_seed()
store.build_graph()
res = allocate_requests_greedy(store.graph, store.resources, store.requests)
logs = res['step_logs']
print(f"Total Steps: {len(logs)}")
for i, s in enumerate(logs):
    print(f"Step {i+1}: {s['request_id']} ({s['requester']}) | Prio={s['priority_score']} | Decision={s['decision']}")
