/**
 * Puzzle Lab Sync API — Cloudflare Worker + KV
 * 提供账号注册/登录/数据同步，支持跨设备
 * KV binding: PUZZEL_LAB_KV
 */

const CORS_H = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
};

function jResp(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: Object.assign({ 'Content-Type': 'application/json' }, CORS_H)
  });
}

// PBKDF2 密码哈希 (Worker 原生 Web Crypto)
async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' },
    keyMaterial, 256
  );
  return btoa(String.fromCharCode(...new Uint8Array(bits)));
}

function genToken() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS_H });

    // ===== 注册 =====
    if (path === '/api/register' && request.method === 'POST') {
      try {
        const { username, password } = await request.json();
        if (!username || !password) return jResp({ error: 'missing_fields' }, 400);
        if (username.length < 2 || username.length > 20) return jResp({ error: 'invalid_username' }, 400);
        if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username)) return jResp({ error: 'invalid_username' }, 400);
        if (password.length < 4) return jResp({ error: 'weak_password' }, 400);

        const userKey = 'user:' + username;
        const existing = await env.PUZZEL_LAB_KV.get(userKey);
        if (existing) return jResp({ error: 'exists' }, 409);

        const salt = genToken().slice(0, 16);
        const hash = await hashPassword(password, salt);
        const token = genToken();

        const userRecord = { username, salt, hash, createdAt: Date.now() };
        await env.PUZZEL_LAB_KV.put(userKey, JSON.stringify(userRecord));
        await env.PUZZEL_LAB_KV.put('session:' + token, username, { expirationTtl: 2592000 }); // 30天过期

        return jResp({ success: true, token, username });
      } catch (e) { return jResp({ error: 'server_error', detail: e.message }, 500); }
    }

    // ===== 登录 =====
    if (path === '/api/login' && request.method === 'POST') {
      try {
        const { username, password } = await request.json();
        if (!username || !password) return jResp({ error: 'missing_fields' }, 400);

        const userKey = 'user:' + username;
        const userStr = await env.PUZZEL_LAB_KV.get(userKey);
        if (!userStr) return jResp({ error: 'not_found' }, 404);

        const user = JSON.parse(userStr);
        const hash = await hashPassword(password, user.salt);
        if (hash !== user.hash) return jResp({ error: 'wrong_password' }, 401);

        const token = genToken();
        await env.PUZZEL_LAB_KV.put('session:' + token, username, { expirationTtl: 2592000 });

        return jResp({ success: true, token, username });
      } catch (e) { return jResp({ error: 'server_error', detail: e.message }, 500); }
    }

    // ===== Token 验证 =====
    const authHeader = request.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;

    if (path === '/api/validate' && request.method === 'GET') {
      if (!token) return jResp({ valid: false }, 401);
      const sessionUser = await env.PUZZEL_LAB_KV.get('session:' + token);
      return jResp({ valid: !!sessionUser, username: sessionUser || null });
    }

    // ===== 用户数据 GET/PUT =====
    if (path === '/api/data' && (request.method === 'GET' || request.method === 'PUT')) {
      if (!token) return jResp({ error: 'unauthorized' }, 401);
      const sessionUser = await env.PUZZEL_LAB_KV.get('session:' + token);
      if (!sessionUser) return jResp({ error: 'unauthorized' }, 401);

      const dataKey = 'data:' + sessionUser;

      if (request.method === 'GET') {
        const dataStr = await env.PUZZEL_LAB_KV.get(dataKey);
        if (!dataStr) return jResp({ documents: [], hiddenItems: [], vocabulary: { words: [], phrases: [] }, customTopics: [], _savedAt: 0 });
        return jResp(JSON.parse(dataStr));
      }

      if (request.method === 'PUT') {
        const data = await request.json();
        data._savedAt = Date.now();
        await env.PUZZEL_LAB_KV.put(dataKey, JSON.stringify(data));
        return jResp({ success: true, _savedAt: data._savedAt });
      }
    }

    // ===== 修改密码 =====
    if (path === '/api/password' && request.method === 'POST') {
      if (!token) return jResp({ error: 'unauthorized' }, 401);
      const sessionUser = await env.PUZZEL_LAB_KV.get('session:' + token);
      if (!sessionUser) return jResp({ error: 'unauthorized' }, 401);

      const { oldPassword, newPassword } = await request.json();
      const userKey = 'user:' + sessionUser;
      const userStr = await env.PUZZEL_LAB_KV.get(userKey);
      const user = JSON.parse(userStr);

      const oldHash = await hashPassword(oldPassword, user.salt);
      if (oldHash !== user.hash) return jResp({ error: 'wrong_password' }, 401);

      const newSalt = genToken().slice(0, 16);
      const newHash = await hashPassword(newPassword, newSalt);
      user.salt = newSalt;
      user.hash = newHash;
      await env.PUZZEL_LAB_KV.put(userKey, JSON.stringify(user));

      return jResp({ success: true });
    }

    // ===== 登出 (清除 session) =====
    if (path === '/api/logout' && request.method === 'POST') {
      if (token) await env.PUZZEL_LAB_KV.delete('session:' + token);
      return jResp({ success: true });
    }

    return jResp({ error: 'not_found', path }, 404);
  }
};
