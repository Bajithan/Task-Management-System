# Task Management System (TMS)

A real-time, full-stack collaborative task management application designed for seamless team coordination.

##  Technologies Used

* **Frontend:** React.js (Vite), Socket.io-client, Axios (API requests), Recharts (graph widgets), Vanilla CSS
* **Backend:** Node.js, Express.js, Socket.io (WebSocket), JWT (authentication), BcryptJS (password encryption)
* **Database & Storage:** Supabase (Cloud PostgreSQL database client, Public Storage buckets for file attachments)
* **Testing:** Jest & Supertest (functional routes and database suite)
* **DevOps & Cloud:** Docker, Docker-compose, GitHub Actions CI/CD, Microsoft Azure (App Service & Static Web Apps)

##  Folder Structure

```text
task-management-system/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration & environment setups
│   │   ├── controllers/     # MVC controller layer (request/response handling)
│   │   ├── middlewares/     # Authentication, RBAC, Rate-Limiting, Sanitization
│   │   ├── models/          # Data access models (Supabase queries)
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Service layer (business logic validation)
│   │   ├── swagger/         # Swagger OpenAPI docs configuration
│   │   └── websocket/       # Real-time event socket endpoints & checkers
│   └── tests/               # Backend routing and functional Jest test suite
└── frontend/
    └── src/
        ├── api/             # Axios REST clients mapping
        ├── components/      # Shared elements (sidebar, navigation, comments)
        ├── context/         # Auth providers context
        ├── hooks/           # useWebSocket interface hook
        └── pages/           # Page layouts (PM Dashboard, Collab Board, Profile)
```

---

## Team Member Contributions & Deliverables

###  BAJITHAN S. — Auth, User Management, DevOps, Project Lead
#### Backend:
* **Authentication:** Login, logout, forgot password, and reset password flows.
* **Tokens:** JWT generation, signing, and verification.
* **User Management:** Create, list, search, update, and deactivate users.
* **Access Control:** Role assignment mechanisms.
* **Onboarding:** Automatic welcome email dispatch with credentials and temporary password.
* **Middlewares & Config:** Audit logging middleware, global error handler, and shared middlewares/utilities (`auth`, `rbac`, `audit`, `jwt`, `email`, `errorHandler`, `responseHelper`).
* **Databases & Docs:** Supabase client configurations and Swagger OpenAPI base setup.

#### Frontend:
* **Views:** `LoginPage`, `ResetPasswordPage`, and `UserManagementPage`.
* **Shared Shells:** Navbar shell, Sidebar, `ProtectedRoute` wrapper, and `LoadingSpinner`.
* **Contexts & Router:** `AuthContext` state controller, `App.jsx` route mappings, and `main.jsx`.

#### DevOps:
* **Git:** GitHub repository setup with development branch rules.
* **Containerization:** `Dockerfile` (backend & frontend) and `docker-compose.yml`.
* **CI/CD:** Automated pipelines via GitHub Actions.
* **Deployment:** Cloud environment deployment setups.
* **Documentation:** Core `README.md` file.

---

###  GAJANAN M. — Projects Module
#### Backend:
* **CRUD:** Project create, list, view, update, and delete endpoints.
* **Management:** Project status state transitions.

#### Frontend:
* **Views:** `ProjectsListPage` and `ProjectDetailPage`.
* **API Integrations:** `projectsApi.js`.

#### Docs:
* **Specs:** Swagger annotations on all project routes.

---

### KOVUZAR S.S. — Tasks Module
#### Backend:
* **CRUD:** Task create, view, update, and delete endpoints.
* **Querying:** Task filtering and sorting.
* **Attributes:** Status updates (`To Do`, `In Progress`, `Completed`) and assignee allocation logic.

#### Frontend:
* **Views:** `TasksPage` (table layout), `KanbanBoardPage` (column board), and `TaskDetailPage`.
* **API Integrations:** `tasksApi.js`.

#### Docs:
* **Specs:** Swagger annotations on all task routes.

---

### THUVARAKAN F.R. — Comments, Notifications, WebSocket
#### Backend:
* **Collaboration:** Comment create, list, and delete endpoints.
* **Alerts:** Notification list, mark read, and mark all read.
* **Real-time Server:** WebSocket server implementation using Socket.io.
* **Websocket Events:** `task-assigned`, `status-changed`, `comment-added`, and `deadline-approaching`.
* **Offline Handling:** Storing user notifications in the database and delivering them upon client reconnection.

#### Frontend:
* **Views & Hooks:** `CommentSection.jsx` (taking `taskId` prop), `NotificationBell.jsx` (plugs into Navbar), `NotificationsPage`, and `useWebSocket.js` hook.
* **API Integrations:** `commentsApi.js` and `notificationsApi.js`.

#### Docs:
* **Specs:** Swagger annotations on comment and notification routes, and WebSocket event reference document.

---

###  NUHA M.N.F — Dashboard, Security, Testing
#### Backend:
* **Metrics:** Dashboard summary stats (counts of tasks by status, priority, overdue state, and project progress).
* **User Profile:** Logged-in profile view and update.
* **Defensive Middlewares:** Rate limiting middleware and request input sanitization.
* **Quality Assurance:** Full integration/unit test suite.

#### Frontend:
* **Views:** `DashboardPage` (with analytical charts) and `ProfilePage`.
* **API Integrations:** `dashboardApi.js`.

#### Docs:
* **Specs:** Swagger annotations on dashboard routes, Security Notes (OWASP mapping), Class Diagram mapping, and Test documentation.

---

## Deployment & Demo Links

* **Live Frontend Demo (Azure SWA):** `https://nice-ground-0784c2100.7.azurestaticapps.net`
* **Live Hosted Backend API (Azure App Service):** `https://taskmanagement-backend-etgbh8czdzhyaucv.southeastasia-01.azurewebsites.net`
* **Production API Documentation (Swagger):** `https://taskmanagement-backend-etgbh8czdzhyaucv.southeastasia-01.azurewebsites.net/api/docs`
* **Azure Container Registry (ACR):** `taskmanageregistry.azurecr.io/task-management-backend`

---
##  Setup & Run Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/Bajithan/Task-Management-System.git
cd task-management-system
```

---

### 2. Database & Storage Setup (Supabase)
Before running the application, set up your Supabase project as follows:

#### A. Database Schema
Run the SQL queries in your Supabase SQL Editor to create the tables with the following attributes:
* **`Users`**: Holds credentials, roles (`Admin`, `Project Manager`, `Collaborator`), and password hashes.
* **`Projects`**: Handles project name, description, dates, and status.
* **`Tasks`**: Links optionally to `project_id`, handles priority (`Low`, `Medium`, `High`), status (`To Do`, `In Progress`, `Completed`), assignee (`assigned_to`), and due dates.
* **`Comments`**: Tracks comment text, task parent keys, commenter IDs, and attachment parameters (`attachment_url`, `file_name`).
* **`Notifications`**: Stores real-time alert logs and read states.
* **`Audit_Logs`**: Records critical administrative changes.

#### B. Storage Bucket Configuration
1. Go to **Storage** in your Supabase Dashboard.
2. Create a new public bucket named **`comment-attachments`**.
3. Set up a Row Level Security (RLS) policy on the bucket to allow public insert/select permissions (`INSERT` and `SELECT` allowed for the `anon` public role) to support binary file uploads from the comments interface.

---

### 3. Backend Setup
1. Navigate into the backend folder:
   ```bash
   cd backend
   ```
2. Install standard Node.js server dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from the example:
   ```bash
   copy .env.example .env
   # On Mac/Linux: cp .env.example .env
   ```
4. Define the following variables in the `.env` file:
   * `PORT`: Server port (default: `5000`)
   * `SUPABASE_URL`: Your Supabase API connection URL
   * `SUPABASE_ANON_KEY`: Your Supabase anonymous client API key
   * `JWT_SECRET`: A secure signing key for JWT token hashing
   * `JWT_EXPIRES_IN`: JWT expiration window 
   * `CLIENT_URL`: Allowed cross-origin (CORS) frontend host address (default: `http://localhost:5173`)
5. Start the backend development server:
   ```bash
   npm run dev
   # Server runs at http://localhost:5000
   ```

---

### 4. Frontend Setup
1. Open a new terminal window and navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install React application dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the frontend folder containing:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the Vite client development server:
   ```bash
   npm run dev
   # Client runs at http://localhost:5173
   ```

---

### 5. Running the Test Suite
To verify the system security, routing, and controllers:
1. Go to the backend folder:
   ```bash
   cd backend
   ```
2. Execute the test runner script:
   ```bash
   npm test
   ```

---

### 6. API Documentation
* Access the Swagger OpenAPI REST endpoint specs by visiting:
   **`http://localhost:5000/api/docs`**
