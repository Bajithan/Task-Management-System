const app = require('./app');
const { PORT } = require('./config/env');
const { createServer } = require('http');
const { initSocket } = require('./websocket/socket');

const httpServer = createServer(app);

// MEMBER 4 — Socket.io attaches to the same HTTP server
initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});