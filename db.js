const mysql = require('mysql2/promise');

// Database configuration - Replace with your actual credentials
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',       // Replace 'localhost' if your DB is elsewhere
    user: process.env.DB_USER || 'your_db_user',  // Replace 'your_db_user'
    password: process.env.DB_PASSWORD || 'your_db_password', // Replace 'your_db_password'
    database: process.env.DB_NAME || 'todo_db',       // Replace 'todo_db'
    port: process.env.DB_PORT || 3306             // Default MySQL port
};

async function createConnection() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Successfully connected to the MySQL database.');
        return connection;
    } catch (error) {
        console.error('Error connecting to MySQL database:', error);
        // If connection fails, attempt to create the database if it doesn't exist
        if (error.code === 'ER_BAD_DB_ERROR') {
            console.log(`Database '${dbConfig.database}' not found. Attempting to create it...`);
            try {
                const tempConfig = { ...dbConfig };
                delete tempConfig.database; // Connect without specifying a database
                const tempConnection = await mysql.createConnection(tempConfig);
                await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
                console.log(`Database '${dbConfig.database}' created successfully or already exists.`);
                await tempConnection.end();
                // Retry connecting to the newly created database
                return await mysql.createConnection(dbConfig);
            } catch (createError) {
                console.error(`Failed to create database '${dbConfig.database}':`, createError);
                process.exit(1); // Exit if database creation fails
            }
        }
        process.exit(1); // Exit if any other connection error occurs
    }
}

async function initializeDatabase() {
    const connection = await createConnection();
    try {
        await connection.query(`
            CREATE TABLE IF NOT EXISTS tasks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                description TEXT NOT NULL,
                completed BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP NULL DEFAULT NULL
            );
        `);
        console.log('Table \'tasks\' created successfully or already exists.');
    } catch (error) {
        console.error('Error initializing database table \'tasks\':', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Call this function when the application starts
// initializeDatabase(); // We'll call this from server.js after routes are defined

module.exports = {
    createConnection,
    initializeDatabase
};

// Note: For a production application, consider using a connection pool (mysql2.createPool)
// for better performance and resource management.