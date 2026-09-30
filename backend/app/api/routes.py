# FastAPI Router handling Graph, Resources, Requests, Allocation, and Comparison endpoints
from fastapi import APIRouter, HTTPException
from app.models.store import store
from app.models.schemas import NodeModel, EdgeModel, ResourceModel, RequestCreateModel, ConfigModel
from app.algorithms.greedy import allocate_requests_greedy

router = APIRouter()

@router.get("/graph")
def get_graph():
    return {
        "nodes": store.nodes,
        "edges": store.edges
    }

@router.post("/graph/nodes")
def add_node(node: NodeModel):
    for n in store.nodes:
        if n["id"] == node.id:
            n["name"] = node.name
            store.build_graph()
            return {"message": "Node updated", "node": n}
    new_node = node.model_dump()
    store.nodes.append(new_node)
    store.build_graph()
    return {"message": "Node added", "node": new_node}

@router.post("/graph/edges")
def add_edge(edge: EdgeModel):
    edge_dict = edge.model_dump()
    for e in store.edges:
        if (e["u"] == edge_dict["u"] and e["v"] == edge_dict["v"]) or (e["u"] == edge_dict["v"] and e["v"] == edge_dict["u"]):
            e["weight"] = edge_dict["weight"]
            store.build_graph()
            return {"message": "Edge updated", "edge": e}
    store.edges.append(edge_dict)
    store.build_graph()
    return {"message": "Edge added", "edge": edge_dict}

@router.get("/resources")
def get_resources():
    return store.resources

@router.post("/resources")
def add_resource(res: ResourceModel):
    res_dict = res.model_dump()
    for r in store.resources:
        if r["id"] == res_dict["id"]:
            r.update(res_dict)
            return {"message": "Resource updated", "resource": r}
    store.resources.append(res_dict)
    return {"message": "Resource added", "resource": res_dict}

@router.get("/requests")
def get_requests():
    return store.requests

@router.post("/requests")
def create_request(req: RequestCreateModel):
    req_dict = req.model_dump()
    next_id = f"REQ_{len(store.requests) + 1:03d}"
    req_dict["id"] = next_id
    req_dict["submission_time"] = len(store.requests) + 1
    store.requests.append(req_dict)
    return {"message": "Request created", "request": req_dict}

@router.get("/config")
def get_config():
    return store.config

@router.post("/config")
def update_config(config: ConfigModel):
    store.config = config.model_dump()
    return {"message": "Config updated", "config": store.config}

@router.post("/reset")
def reset_data():
    store.reset_to_seed()
    return {"message": "Data reset to initial seed"}

@router.get("/allocate")
def run_allocation():
    store.build_graph()
    results = allocate_requests_greedy(
        campus_graph=store.graph,
        resources=store.resources,
        requests=store.requests,
        config=store.config,
        baseline_mode=False
    )
    return results

@router.get("/compare")
def compare_strategies():
    store.build_graph()
    greedy_res = allocate_requests_greedy(
        campus_graph=store.graph,
        resources=store.resources,
        requests=store.requests,
        config=store.config,
        baseline_mode=False
    )
    baseline_res = allocate_requests_greedy(
        campus_graph=store.graph,
        resources=store.resources,
        requests=store.requests,
        config=store.config,
        baseline_mode=True
    )
    return {
        "greedy": greedy_res["metrics"],
        "baseline_fcfs": baseline_res["metrics"]
    }
