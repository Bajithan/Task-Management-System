# Task Management System - Backend Class Diagram

Below is the class diagram representing the system's modular architecture (using standard MVC/Service-oriented layers) and call hierarchy (Routes $\rightarrow$ Controllers $\rightarrow$ Services $\rightarrow$ Models $\rightarrow$ Supabase Database).

## 1. Class Diagram (Mermaid)

```mermaid
classDiagram
    %% Core layers
    class Router {
        +authRoutes
        +userRoutes
        +projectRoutes
        +taskRoutes
        +commentRoutes
        +notificationRoutes
        +dashboardRoutes
    }

    class Controller {
        +authController
        +userController
        +projectController
        +taskController
        +commentController
        +notificationController
        +dashboardController
    }

    class Service {
        +authService
        +userService
        +projectService
        +taskService
        +commentService
        +notificationService
        +dashboardService
    }

    class Model {
        +userModel
        +projectModel
        +taskModel
        +commentModel
        +notificationModel
        +dashboardModel
    }

    class SupabaseDB {
        <<Service>>
        +createClient(URL, KEY)
        +from(table)
        +select(fields)
        +insert(payload)
        +update(payload)
        +delete()
    }

    %% Relationship & Call Flow
    Router --> Controller : Passes express request & response (HTTP)
    Controller --> Service : Standardizes request parameters & invokes functions
    Service --> Model : Implements validation, sends payload to data access layer
    Model --> SupabaseDB : Executes queries using PostgreSQL bindings

    %% Specific Endpoint Methods Examples
    class projectController {
        +getProjects(req, res)
        +getProjectById(req, res)
        +createProject(req, res)
        +updateProject(req, res)
        +deleteProject(req, res)
    }

    class projectService {
        +getProjects()
        +getProjectById(id)
        +createProject(data)
        +updateProject(id, data)
        +deleteProject(id)
    }

    class projectModel {
        +findAll()
        +findById(id)
        +create(data)
        +update(id, data)
        +delete(id)
    }

    projectController --> projectService : calls
    projectService --> projectModel : calls
    projectModel --> SupabaseDB : queries Projects table
```

---

## 2. Module Flow Details

1. **Routes (API Entry point):** Matches request paths (e.g. `GET /api/projects/:id`), executes middleware checks (such as `authenticate` and `allowRoles`), and delegates request context to the controller.
2. **Controllers (Request Handlers):** Parses parameters (`req.params`, `req.query`, `req.body`), passes data to the matching Service, and returns formatted responses (`successResponse` / `errorResponse`) to the client.
3. **Services (Business Logic Layer):** Executes business constraints (e.g. checking that a project name is not empty or password passwords meet length requirements) and coordinates model queries.
4. **Models (Data Access Layer):** Integrates the Supabase Client database bindings, communicating with the cloud PostgreSQL engine to insert, select, or modify rows.
