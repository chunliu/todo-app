# Simple Todo Web App (Node.js, Express, MySQL)

This is a simple web application for managing a list of todo tasks. It's built with Node.js, Express.js for the backend, and uses a MySQL database to store tasks. The frontend is plain HTML, CSS, and JavaScript.

## Features

- Display a list of todo tasks.
- Each task shows:
    - Status (checkbox: done/not-done)
    - Description
    - Created Time
    - Completed Time (if applicable)
- Create new tasks via a modal form.
- Tasks are persisted in a MySQL database.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14.x or later recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/) installed and running.

## Setup and Installation

1.  **Clone the repository (or download the files):**
    ```bash
    # If you have git installed
    # git clone <repository_url>
    # cd <repository_folder>
    ```

2.  **Install dependencies:**
    Navigate to the project directory in your terminal and run:
    ```bash
    npm install
    ```

3.  **Set up the database:**
    *   Ensure your MySQL server is running.
    *   Create a database for the application (e.g., `todo_db`). You can do this using a MySQL client like MySQL Workbench, phpMyAdmin, or the command line:
        ```sql
        CREATE DATABASE todo_db;
        ```
    *   Create a MySQL user with permissions to access this database, or use an existing user (like `root` for local development, though not recommended for production).

4.  **Configure environment variables:**
    *   Create a `.env` file in the root of the project directory by copying the example file:
        ```bash
        cp .env.example .env
        ```
    *   Open the `.env` file and update the database credentials:
        ```env
        DB_HOST=localhost
        DB_USER=your_mysql_user       # Replace with your MySQL username
        DB_PASSWORD=your_mysql_password # Replace with your MySQL password
        DB_NAME=todo_db               # Or the name you chose for your database
        DB_PORT=3306                  # Default MySQL port

        # Optional: Set a different port for the application
        # PORT=3001
        ```

## Running the Application

1.  **Start the server:**
    ```bash
    npm start
    ```
    This will start the Node.js server. The application will also attempt to create the `tasks` table in your database if it doesn't already exist.

2.  **For development (with automatic server restart on file changes):**
    ```bash
    npm run dev
    ```
    This uses `nodemon` to monitor for changes.

3.  **Access the application:**
    Open your web browser and go to `http://localhost:3000` (or the port you configured in `.env` or the default port shown in the console).

## Project Structure

```
.env                # Environment variables (database credentials, etc.) - DO NOT COMMIT
.env.example        # Example environment variables
api.js              # Defines API routes for tasks
db.js               # Database connection and initialization logic
package.json        # Project metadata and dependencies
package-lock.json   # Exact versions of dependencies
README.md           # This file
server.js           # Main Express server setup
public/
    index.html      # Main HTML page for the frontend
    script.js       # Client-side JavaScript for interactivity
    style.css       # CSS styles for the frontend
```

## How it Works

-   **Backend (`server.js`, `api.js`, `db.js`):**
    -   `server.js`: Sets up the Express application, serves static files from the `public` directory, and mounts the API routes.
    -   `api.js`: Handles HTTP requests for task-related operations (GET, POST, PUT). It interacts with the database.
    -   `db.js`: Manages the MySQL connection and includes a function to initialize the `tasks` table.
-   **Frontend (`public/` directory):
    -   `index.html`: The structure of the web page.
    -   `style.css`: Styles for the page.
    -   `script.js`: Handles user interactions (opening modal, saving tasks, marking tasks complete) and makes `fetch` requests to the backend API to get and update data.
-   **Database:**
    -   A MySQL database stores the tasks in a table named `tasks` with columns for `id`, `description`, `completed` status, `created_at`, and `completed_at` timestamps.

## TODO / Potential Improvements

-   Add task deletion functionality.
-   Implement task editing (description).
-   Add more robust error handling and user feedback.
-   Input validation on both client and server sides.
-   Use a connection pool for MySQL for better performance in `db.js`.
-   Add user authentication to make it a multi-user app.
-   Write unit and integration tests.
-   Consider a more advanced frontend framework (e.g., React, Vue, Angular) for larger applications.
-   Environment-specific configurations (development, production).