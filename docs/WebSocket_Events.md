# Task Management System - WebSocket Event Reference

This document provides a technical guide to the real-time event system powered by **Socket.io** on the backend and frontend client connections.

---

## 1. WebSocket Server & Handshake Connection

* **Port/Host:** Connected to the main API HTTP server (default: `http://localhost:5000` in development).
* **Handshake Authentication:** During connection initialization, Socket.io interceptors inspect the JWT token passed inside `socket.handshake.auth.token`. Connections lacking tokens or carrying invalid signatures are immediately rejected with an authentication error.
* **User Isolation (Rooms):** Upon successful connection, sockets are routed to a private room mapped to the user ID:
  ```javascript
  socket.join(`user-${userId}`);
  ```
  This supports multiple concurrent logins or browser tabs for a single user, ensuring all active connections receive updates.

---

## 2. Event Types & Payload Specifications

### 📥 1. `task-assigned`
* **Trigger:** A project manager creates a task with an assignee or updates an existing task's assignee.
* **Logic:** Emitted to the newly assigned collaborator.
* **Payload Structure:**
  ```json
  {
    "notification_id": "c7a72d3f-561b-4cf7-8b06-444747a8bc61",
    "user_id": "8fa8de4c-112b-47f2-9a05-181156a8bc62",
    "message": "Sarah Jenkins assigned you to task: \"Develop Login Page API\"",
    "is_read": false,
    "created_at": "2026-06-25T14:32:11.231Z"
  }
  ```

---

### 📥 2. `status-changed`
* **Trigger:** An assignee (Collaborator) or Project Manager updates the status stage of a task (`To Do`, `In Progress`, `Completed`).
* **Logic:** Emitted to the task's assignee and the project manager who created the task (if they are not the action performer).
* **Payload Structure:**
  ```json
  {
    "notification_id": "a1b2c3d4-5678-90ab-cdef-1234567890ab",
    "user_id": "3c98de1c-829b-44f2-9a05-120056e9ca14",
    "message": "John Doe changed status of task \"Develop Login Page API\" to \"In Progress\"",
    "is_read": false,
    "created_at": "2026-06-25T14:35:45.102Z"
  }
  ```

---

### 📥 3. `comment-added`
* **Trigger:** A collaborator or manager submits a comment on a task.
* **Logic:** Emitted to both the task's assignee and the task creator (excluding the user who authored the comment).
* **Payload Structure:**
  ```json
  {
    "notification_id": "f5e6d7c8-90ab-cdef-1234-567890abcdef",
    "user_id": "3c98de1c-829b-44f2-9a05-120056e9ca14",
    "message": "Sarah Jenkins commented on task \"Develop Login Page API\": \"I have uploaded the postman tests payload.\"",
    "is_read": false,
    "created_at": "2026-06-25T14:40:22.903Z"
  }
  ```

---

### 📥 4. `deadline-approaching`
* **Trigger:** An hourly background job scheduler checks all uncompleted tasks and identifies those due within the next **24 hours**.
* **Logic:** Fired to the collaborator assigned to the task to prevent missed milestones.
* **Payload Structure:**
  ```json
  {
    "notification_id": "7b8c9d0e-1a2b-3c4d-5e6f-7a8b9c0d1e2f",
    "user_id": "8fa8de4c-112b-47f2-9a05-181156a8bc62",
    "message": "Deadline approaching for task: \"Develop Login Page API\" (Due: 2026-06-26)",
    "is_read": false,
    "created_at": "2026-06-25T15:00:00.000Z"
  }
  ```

---

### 📥 5. `offline-notifications`
* **Trigger:** Fired immediately after the handshake connection succeeds.
* **Logic:** If an offline user receives notifications, the server stores them in the database. Upon reconnection, this event pushes all unread notifications to sync the client UI.
* **Payload Structure:** An array of notification items:
  ```json
  [
    {
      "notification_id": "c7a72d3f-561b-4cf7-8b06-444747a8bc61",
      "user_id": "8fa8de4c-112b-47f2-9a05-181156a8bc62",
      "message": "Sarah Jenkins assigned you to task: \"Develop Login Page API\"",
      "is_read": false,
      "created_at": "2026-06-25T14:32:11.231Z"
    }
  ]
  ```

---

## 3. Client Reconnection & Error Strategies

* **Client Setup (`useWebSocket.js`):** The client utilizes standard auto-reconnection parameters:
  ```javascript
  const socket = io(API_URL, {
    auth: { token: localStorage.getItem('token') },
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    randomizationFactor: 0.5
  });
  ```
* **Auto Re-Authentication:** If the socket drops, the client automatically attempts reconnection and re-submits the latest stored JWT token in the handshake auth object.
