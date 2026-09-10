const { createProxyMiddleware } = require('http-proxy-middleware');

// El frontend llama /api/xxx pero cada microservicio escucha en /xxx (sin el prefijo).
function proxyTo(target) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: { '^/api': '' },
    onProxyReq: (proxyReq, req) => {
      if (req.user) {
        proxyReq.setHeader('X-User-Id', String(req.user.id));
        proxyReq.setHeader('X-User-Rol', req.user.rol);
      }
    },
  });
}

module.exports = proxyTo;
