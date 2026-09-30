const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const authenticateToken = require('../middleware/auth');

// All task routes require authentication
router.use(authenticateToken);

// Get tasks: GET /api/tasks
router.get('/', async (req, res) => {
  const userId = req.user.id;
  const { status, priority } = req.query;

  try {
    let query = 'SELECT * FROM tasks WHERE user_id = $1';
    const params = [userId];

    if (status && status !== 'All') {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    if (priority && priority !== 'All') {
      params.push(priority);
      query += ` AND priority = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.status(200).json({ tasks: result.rows });
  } catch (error) {
    console.error('Fetch tasks error:', error);
    res.status(500).json({ error: 'Failed to retrieve tasks.' });
  }
});

// Create task: POST /api/tasks
router.post('/', async (req, res) => {
  const userId = req.user.id;
  const { title, description, status, priority, due_date } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Task title is required.' });
  }

  const validStatuses = ['To Do', 'In Progress', 'Completed'];
  const validPriorities = ['Low', 'Medium', 'High'];

  const taskStatus = validStatuses.includes(status) ? status : 'To Do';
  const taskPriority = validPriorities.includes(priority) ? priority : 'Medium';
  const formattedDueDate = due_date && due_date !== '' ? due_date : null;

  try {
    const result = await pool.query(
      `INSERT INTO tasks (user_id, title, description, status, priority, due_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, title.trim(), description || '', taskStatus, taskPriority, formattedDueDate]
    );

    res.status(201).json({
      message: 'Task created successfully',
      task: result.rows[0]
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task.' });
  }
});

// Update task: PUT /api/tasks/:id
router.put('/:id', async (req, res) => {
  const userId = req.user.id;
  const taskId = parseInt(req.params.id, 10);
  const { title, description, status, priority, due_date } = req.body;

  if (isNaN(taskId)) {
    return res.status(400).json({ error: 'Invalid task ID.' });
  }

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Task title is required.' });
  }

  const validStatuses = ['To Do', 'In Progress', 'Completed'];
  const validPriorities = ['Low', 'Medium', 'High'];

  const taskStatus = validStatuses.includes(status) ? status : 'To Do';
  const taskPriority = validPriorities.includes(priority) ? priority : 'Medium';
  const formattedDueDate = due_date && due_date !== '' ? due_date : null;

  try {
    const result = await pool.query(
      `UPDATE tasks
       SET title = $1, description = $2, status = $3, priority = $4, due_date = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [title.trim(), description || '', taskStatus, taskPriority, formattedDueDate, taskId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found or access denied.' });
    }

    res.status(200).json({
      message: 'Task updated successfully',
      task: result.rows[0]
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task.' });
  }
});

// Delete task: DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  const userId = req.user.id;
  const taskId = parseInt(req.params.id, 10);

  if (isNaN(taskId)) {
    return res.status(400).json({ error: 'Invalid task ID.' });
  }

  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id',
      [taskId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found or access denied.' });
    }

    res.status(200).json({
      message: 'Task deleted successfully',
      taskId
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task.' });
  }
});

module.exports = router;
