const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export async function fetchGraph() {
  const res = await fetch(`${API_BASE}/graph`);
  return res.json();
}

export async function fetchResources() {
  const res = await fetch(`${API_BASE}/resources`);
  return res.json();
}

export async function fetchRequests() {
  const res = await fetch(`${API_BASE}/requests`);
  return res.json();
}

export async function fetchConfig() {
  const res = await fetch(`${API_BASE}/config`);
  return res.json();
}

export async function updateConfig(configData) {
  const res = await fetch(`${API_BASE}/config`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(configData)
  });
  return res.json();
}

export async function runAllocation() {
  const res = await fetch(`${API_BASE}/allocate`);
  return res.json();
}

export async function runComparison() {
  const res = await fetch(`${API_BASE}/compare`);
  return res.json();
}

export async function createRequest(reqData) {
  const res = await fetch(`${API_BASE}/requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reqData)
  });
  return res.json();
}

export async function addResource(resData) {
  const res = await fetch(`${API_BASE}/resources`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(resData)
  });
  return res.json();
}

export async function addEdge(edgeData) {
  const res = await fetch(`${API_BASE}/graph/edges`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(edgeData)
  });
  return res.json();
}

export async function resetData() {
  const res = await fetch(`${API_BASE}/reset`, {
    method: "POST"
  });
  return res.json();
}
