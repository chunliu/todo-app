# Simple Todo Web App (Node.js, Express, MySQL)

This is a simple web application for managing a list of todo tasks. It's built with Node.js and Express.js for the backend, uses a MySQL database to store tasks, and features a plain HTML, CSS, and JavaScript frontend. The application is designed to be deployed to Kubernetes using a Blue/Green deployment strategy managed by GitHub Actions.

## Features

- Display a list of todo tasks.
- Each task shows:
    - Status (checkbox: done/not-done)
    - Description
    - Created Time
    - Completed Time (if applicable)
- Create new tasks via a modal form.
- Tasks are persisted in a MySQL database.

## Project Structure

```
├── .dockerignore
├── .env.example
├── .github/                    # GitHub Actions workflows
│   └── workflows/
│       ├── blue-deployment.yaml  # Workflow for Blue environment
│       └── green-deployment.yaml # Workflow for Green environment
├── .gitignore
├── Dockerfile                  # Defines the application's Docker image
├── README.md                   # This file
├── api.js                      # Defines API routes for tasks
├── db.js                       # Database connection and initialization logic
├── deploy.sh                   # Deployment script used by GitHub Actions
├── k8s/                        # Kubernetes manifests
│   ├── base/                   # Base Kustomize configurations
│   │   ├── deployment.yaml
│   │   ├── ingress-canary.yaml # Ingress for canary (Green) traffic
│   │   ├── ingress.yaml        # Main ingress (Blue traffic by default)
│   │   ├── kustomization.yaml
│   │   ├── namespace.yaml
│   │   └── service.yaml
│   └── overlays/               # Kustomize overlays for different environments
│       ├── blue/               # Kustomization for Blue environment
│       └── green/              # Kustomization for Green environment
├── package-lock.json
├── package.json
├── public/                     # Frontend static assets
│   ├── index.html
│   ├── script.js
│   └── style.css
└── server.js                   # Main Express server setup
```

## Local Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.x or later recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/) installed and running.

### Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd <repository_folder>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up the database:**
    *   Ensure your MySQL server is running.
    *   Create a database (e.g., `todo_db`):
        ```sql
        CREATE DATABASE todo_db;
        ```
    *   Create a MySQL user with permissions for this database.

4.  **Configure environment variables:**
    *   Copy the example environment file:
        ```bash
        cp .env.example .env
        ```
    *   Update `.env` with your database credentials:
        ```env
        DB_HOST=localhost
        DB_USER=your_mysql_user
        DB_PASSWORD=your_mysql_password
        DB_NAME=todo_db
        DB_PORT=3306
        # PORT=3000 # Optional: application port
        ```

### Running the Application Locally

1.  **Start the server:**
    ```bash
    npm start
    ```
2.  **For development with auto-restart:**
    ```bash
    npm run dev
    ```
3.  **Access:** Open `http://localhost:3000` (or your configured port) in a browser.

## Deployment Workflow (Blue/Green)

This project utilizes a Blue/Green deployment strategy to minimize downtime and risk when releasing new versions. The deployment is orchestrated using GitHub Actions, Docker, Kubernetes, and Kustomize.

### Overview

1.  **Trigger:** Deployments are typically triggered by pushing a new version tag (e.g., `v1.2.3`) to the repository. This can be configured for either the Blue or Green environment workflow.
2.  **Build & Push Image:** The GitHub Actions workflow (`blue-deployment.yaml` or `green-deployment.yaml`):
    *   Checks out the code.
    *   Builds a Docker image using the `Dockerfile`.
    *   Tags the image with the version (e.g., `your-registry/env-todo-app:v1.2.3`).
    *   Logs into a container registry (configured via secrets).
    *   Pushes the Docker image to the registry.
3.  **Kubernetes Deployment with Kustomize:**
    *   The workflow sets up `kubectl` and `kustomize`.
    *   It executes the `deploy.sh` script.
    *   The `deploy.sh` script:
        *   Populates `secrets.env` and `configs.env` in `k8s/base/` from GitHub Actions environment variables (which are sourced from secrets).
        *   Uses `kustomize edit set image` to update the base `kustomization.yaml` to point to the newly built Docker image and tag.
        *   Applies the Kubernetes manifests using `kubectl apply -k k8s/overlays/<blue_or_green>`. The overlay for the target environment (Blue or Green) customizes the base manifests (e.g., service names, specific labels).

### Blue/Green Strategy Implementation

*   **Two Environments:** The Kubernetes cluster is configured to host two nearly identical environments: "Blue" (typically the current stable production) and "Green" (the new version, or staging).
*   **Separate Services:** Each environment has its own Kubernetes Service (e.g., `blue-todo-app-service` and `green-todo-app-service`).
*   **Ingress Routing:**
    *   A main Nginx Ingress resource (`k8s/base/ingress.yaml`) directs live user traffic. By default, this ingress points to the `blue-todo-app-service`.
    *   A separate canary Nginx Ingress resource (`k8s/base/ingress-canary.yaml`) is configured to point to the `green-todo-app-service`. Initially, its traffic weight is set to 0% (`nginx.ingress.kubernetes.io/canary-weight: "0"`).
*   **Deployment Process:**
    1.  A new version of the application is deployed to the **inactive** environment (e.g., if Blue is live, deploy to Green).
    2.  The GitHub Action workflow for the target environment (e.g., `green-deployment.yaml`) builds the image and applies the Kustomize overlay for Green. This updates the pods in the Green deployment without affecting live Blue traffic.
    3.  **Testing:** The Green environment can then be tested internally (e.g., via a specific host, port-forwarding, or internal DNS).
*   **Traffic Switching:**
    *   **Full Switch:** To make the Green environment live, the main `ingress.yaml`'s backend service can be updated to point from `blue-todo-app-service` to `green-todo-app-service`, and then `kubectl apply` this change. This redirects all traffic to the new version.
    *   **Canary Release (Gradual Rollout):** Alternatively, the `ingress-canary.yaml` can be used. By gradually increasing the `nginx.ingress.kubernetes.io/canary-weight` annotation on the canary ingress (e.g., from 0% to 10%, 50%, then 100%) and applying the changes, traffic can be slowly shifted from Blue to Green. This allows for monitoring the new version under real traffic before a full switch.
    *   Once the Green environment is stable and handling all traffic, the Blue environment becomes the inactive/staging environment for the next release.

### Triggering a Deployment

-   Push a Git tag matching the pattern `v*` (e.g., `v1.0.0`, `v1.0.1-beta`) to trigger the `Blue Deployment` or `Green Deployment` GitHub Actions workflow.
-   Deployments can also be triggered manually via the GitHub Actions UI (`workflow_dispatch`).

### Key Configuration Files for Deployment:

-   `.github/workflows/blue-deployment.yaml`: GitHub Actions workflow for deploying to the Blue environment.
-   `.github/workflows/green-deployment.yaml`: GitHub Actions workflow for deploying to the Green environment.
-   `Dockerfile`: Instructions to build the application's Docker image.
-   `deploy.sh`: Script to manage Kustomize image updates and apply Kubernetes configurations.
-   `k8s/base/`: Base Kubernetes manifests and Kustomize configuration.
    -   `deployment.yaml`: Defines how the application is run in Kubernetes.
    -   `service.yaml`: Exposes the application within the Kubernetes cluster.
    -   `ingress.yaml`: Manages external access to the Blue (stable) service.
    -   `ingress-canary.yaml`: Manages external access for the Green (canary/new) service.
    -   `kustomization.yaml`: Defines the Kustomize build for the base.
-   `k8s/overlays/blue/`: Kustomize overlay for the Blue environment.
-   `k8s/overlays/green/`: Kustomize overlay for the Green environment.

## TODO / Potential Improvements

-   Add task deletion and editing functionality.
-   Implement more robust error handling and user feedback.
-   Add input validation (client and server-side).
-   Use a MySQL connection pool for better performance.
-   Consider user authentication for a multi-user app.
-   Write unit and integration tests.
-   Automate the traffic switching part of Blue/Green (e.g., via a script or further GitHub Actions steps after successful health checks on the Green environment).
-   Integrate automated rollback procedures in case of deployment failure.