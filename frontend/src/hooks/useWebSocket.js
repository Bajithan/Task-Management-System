// frontend/src/hooks/useWebSocket.js
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// The address of our backend server
const SOCKET_SERVER_URL = 'http://localhost:5000';

export const useWebSocket = () => {
    // Keep track of the connection so other parts of the app can use it
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    // useEffect tells React to run this code as soon as the app loads
    useEffect(() => {
        // Grab the user's secret token to pass our backend security checkpoint
        const token = localStorage.getItem('token');

        if (!token) {
            console.log("Not logged in, skipping WebSocket connection.");
            return;
        }

        // 1. Actually plug into the backend tube
        const socketInstance = io(SOCKET_SERVER_URL, {
            auth: {
                token: token
            }
        });

        // 2. Handle a successful connection
        socketInstance.on('connect', () => {
            console.log('🟢 Connected to live WebSocket server!');
            setIsConnected(true);
        });

        // 3. Handle losing the connection
        socketInstance.on('disconnect', () => {
            console.log('🔴 Disconnected from WebSocket server.');
            setIsConnected(false);
        });

        // Save the live connection to our state
        setSocket(socketInstance);

        // 4. Cleanup rule: If the user closes the website, unplug the tube
        return () => {
            socketInstance.disconnect();
        };
    }, []); // The empty brackets mean "only run this setup once"

    // Return the live socket so buttons and notifications can use it
    return { socket, isConnected };
};