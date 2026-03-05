// 🔥 IMPORTANT: Change 5000 to your backend port
const API_BASE = 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('token');
}

// ================= LOGIN =================
export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Login failed');
  }

  // ✅ Save token automatically after login
  if (data.token) {
    localStorage.setItem('token', data.token);
  }

  return data;
}

// ================= REGISTER =================
export async function register(body, token = null) {
  const headers = { 'Content-Type': 'application/json' };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Registration failed');
  }

  return data;
}

// ================= GENERIC API CALL =================
// ================= GENERIC API CALL =================
export async function api(path, options = {}) {
  const token = getToken();

  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : { 'Content-Type': 'application/json' }),
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fetchOptions = {
    ...options,
    headers,
  };

  if (
    fetchOptions.body &&
    typeof fetchOptions.body === 'object' &&
    !(fetchOptions.body instanceof FormData)
  ) {
    fetchOptions.body = JSON.stringify(fetchOptions.body);
  }

  // ✅ THIS LINE WAS MISSING
  const res = await fetch(`${API_BASE}${path}`, fetchOptions);

  const contentType = res.headers.get('content-type');

  let data = null;
  if (contentType && contentType.includes('application/json')) {
    data = await res.json();
  }

  if (!res.ok) {
    throw new Error(data?.message || `Request failed: ${res.status}`);
  }

  return data;
}


// ================= PARSE JWT =================
export function parseJwt(token) {
  try {
    const base64 = token.split('.')[1];
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}
