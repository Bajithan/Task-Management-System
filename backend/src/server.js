const app = require('./app');
const { PORT } = require('./config/env');
const http = require('http');

// 1. Bring in the WebSocket tool we just built
const { initializeWebSocket } = require('./websocket/socket'); 

const httpServer = http.createServer(app);

// 2. Turn the WebSocket server on
initializeWebSocket(httpServer); 

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});