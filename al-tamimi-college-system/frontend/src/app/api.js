const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export function apiUrl(path) {
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
}

export async function downloadFile(path, { token, filename } = {}) {
  const res = await fetch(apiUrl(path), {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const message = `HTTP ${res.status}`;
    throw new Error(message);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "download";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function apiFetch(path, { token, method = "GET", body } = {}) {
  const res = await fetch(apiUrl(path), {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const isJson = (res.headers.get("content-type") || "").includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const message = data?.error?.message || `HTTP ${res.status}`;
    throw new Error(message);
  }

  return data;
}
