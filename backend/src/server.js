const app = require('./app');
const { PORT } = require('./config/env');
const http = require('http');
const { initSocket } = require('./websocket/socket');

const httpServer = http.createServer(app);

initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});