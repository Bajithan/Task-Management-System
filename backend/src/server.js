const app = require('./app');
const { PORT } = require('./config/env');
const http = require('http');

// 1. Bring in the WebSocket tool we just built
const { initializeWebSocket, startDeadlineChecks } = require('./websocket/socket'); 

const httpServer = http.createServer(app);

// 2. Turn the WebSocket server on
const io = initializeWebSocket(httpServer); 
app.set('io', io);

// 3. Start checking for approaching deadlines
startDeadlineChecks(io);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});