const store = new Map();
var CORS_H = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400' };
function jResp(data, status) { return new Response(JSON.stringify(data), { status: status || 200, headers: Object.assign({ 'Content-Type': 'application/json' }, CORS_H) }); }
export default {
  async fetch(request) {
    var url = new URL(request.url), path = url.pathname;
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS_H });
    if (path === '/registry' && request.method === 'GET') { var r = store.get('registry') || { type: 'listencloze-registry', users: {}, createdAt: Date.now() }; return jResp(r); }
    if (path === '/registry' && request.method === 'PUT') { store.set('registry', await request.json()); return jResp({ success: true }); }
    var m = path.match(/^\/user\/(.+)$/);
    if (m) { var k = m[1];
      if (request.method === 'GET') { var d = store.get('user:' + k); return d ? jResp(d) : jResp({ error: 'not_found' }, 404); }
      if (request.method === 'PUT') { store.set('user:' + k, await request.json()); return jResp({ success: true }); }
      if (request.method === 'POST') { if (store.has('user:' + k)) return jResp({ error: 'exists' }, 409); store.set('user:' + k, await request.json()); return jResp({ success: true }); }
    }
    return jResp({ error: 'not_found', path: path }, 404);
  },
};
