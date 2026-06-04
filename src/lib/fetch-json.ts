export async function fetchJson<T>(
  url: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    ...init,
    credentials: "same-origin",
  });

  const text = await res.text();
  const trimmed = text.trim();

  if (!trimmed) {
    if (res.status === 401) {
      redirectToLogin();
      throw new Error("Please sign in again");
    }
    throw new Error(`Server returned an empty response (${res.status})`);
  }

  let data: T & { error?: string };
  try {
    data = JSON.parse(trimmed) as T & { error?: string };
  } catch {
    throw new Error(
      res.ok
        ? "Server returned invalid JSON"
        : `Request failed (${res.status}). You may need to sign in again.`
    );
  }

  if (!res.ok) {
    if (res.status === 401) redirectToLogin();
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return data;
}

function redirectToLogin() {
  if (typeof window !== "undefined") {
    const from = window.location.pathname;
    window.location.href =
      from === "/login" ? "/login" : `/login?from=${encodeURIComponent(from)}`;
  }
}
