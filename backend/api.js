import express from 'express';
import DB from './db.js';

const router = express.Router();
const db = new DB();
const dbReady = db.connect();

router.get('/', (req, res) => {
    res.json({ message: 'Todo API läuft' });
});

router.get('/todos', async (req, res) => {
    try {
        await dbReady;
        const todos = await db.queryAll();
        res.json(todos);
    } catch (err) {
        console.error('GET todos error:', err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/todos/:id', async (req, res) => {
    try {
        await dbReady;
        const todo = await db.queryById(req.params.id);
        if (!todo) return res.status(404).send();
        res.json(todo);
    } catch (err) {
        console.error('GET todo by id error:', err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/todos', async (req, res) => {
    try {
        await dbReady;
        const newTodo = await db.insert(req.body);
        res.status(201).json(newTodo);
    } catch (err) {
        console.error('POST todo error:', err);
        res.status(500).json({ error: err.message });
    }
});

router.put('/todos/:id', async (req, res) => {
    try {
        await dbReady;
        const updatedTodo = await db.update(req.params.id, req.body);
        if (!updatedTodo) return res.status(404).send();
        res.json(updatedTodo);
    } catch (err) {
        console.error('PUT error:', err);
        res.status(500).json({ error: err.message });
    }
});

router.delete('/todos/:id', async (req, res) => {
    try {
        await dbReady;
        const result = await db.delete(req.params.id);
        if (result.deletedCount === 0) return res.status(404).send();
        res.status(204).send();
    } catch (err) {
        console.error('DELETE todo error:', err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
