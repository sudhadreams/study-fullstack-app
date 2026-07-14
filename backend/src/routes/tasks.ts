import { Router } from 'express';
import { getPool } from '../db/connection';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT Id, Title, Completed FROM Tasks');
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.post('/', async (req, res) => {
  const { title } = req.body;
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('title', title)
      .query('INSERT INTO Tasks (Title, Completed) OUTPUT INSERTED.Id, INSERTED.Title, INSERTED.Completed VALUES (@title, 0)');
    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

router.patch('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { title, completed } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'Invalid task id' });
  }

  try {
    const pool = await getPool();
    const request = pool.request().input('id', id);

    let query = 'UPDATE Tasks SET ';
    const updates: string[] = [];

    if (typeof title === 'string') {
      request.input('title', title);
      updates.push('Title = @title');
    }
    if (typeof completed === 'boolean') {
      request.input('completed', completed ? 1 : 0);
      updates.push('Completed = @completed');
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nothing to update' });
    }

    query += updates.join(', ') + ' WHERE Id = @id; SELECT Id, Title, Completed FROM Tasks WHERE Id = @id';
    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'Invalid task id' });
  }

  try {
    const pool = await getPool();
    await pool.request().input('id', id).query('DELETE FROM Tasks WHERE Id = @id');
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;