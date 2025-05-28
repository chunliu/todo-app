const express = require('express');
const router = express.Router();
const { createConnection } = require('./db'); // Assuming db.js is in the same directory

// GET /api/tasks - Get all tasks
router.get('/tasks', async (req, res) => {
    let connection;
    try {
        connection = await createConnection();
        const [rows] = await connection.query('SELECT * FROM tasks ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: 'Error fetching tasks from database' });
    } finally {
        if (connection) await connection.end();
    }
});

// POST /api/tasks - Create a new task
router.post('/tasks', async (req, res) => {
    const { description } = req.body;
    if (!description || description.trim() === '') {
        return res.status(400).json({ message: 'Task description cannot be empty' });
    }

    let connection;
    try {
        connection = await createConnection();
        const [result] = await connection.query('INSERT INTO tasks (description) VALUES (?)', [description.trim()]);
        res.status(201).json({ id: result.insertId, description: description.trim(), completed: false, created_at: new Date() });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ message: 'Error creating task in database' });
    } finally {
        if (connection) await connection.end();
    }
});

// PUT /api/tasks/:id - Update a task (e.g., mark as completed)
router.put('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;

    if (typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'Invalid completed status' });
    }

    let connection;
    try {
        connection = await createConnection();
        const completed_at = completed ? new Date() : null;
        const [result] = await connection.query('UPDATE tasks SET completed = ?, completed_at = ? WHERE id = ?', [completed, completed_at, id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json({ message: 'Task updated successfully' });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: 'Error updating task in database' });
    } finally {
        if (connection) await connection.end();
    }
});

module.exports = router;