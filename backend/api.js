import express from 'express';
const router = express.Router();

/**
 * Beispiel: zusätzliche Route (Erweiterung der Aufgabe)
 * z. B. Status-Statistik oder Filter
 */

let TODOS = [
    {
        "_id": 1671056616571,
        "title": "Übung 4 machen",
        "due": "2022-11-12T00:00:00.000Z",
        "status": 0
    },
    {
        "_id": 1671087245763,
        "title": "Für die Klausur Webentwicklung lernen",
        "due": "2023-01-14T00:00:00.000Z",
        "status": 2
    }
];

router.get('/', (req, res) => {
    res.json({ message: 'Todo API läuft' });
});

router.get('/todos', (req, res) => {
    res.json(TODOS);
});

router.post('/todos', (req, res) => {
    const newTodo = {
        ...req.body,
        _id: Date.now()
    };

    TODOS.push(newTodo);
    res.status(201).json(newTodo);
});

router.put('/todos/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const index = TODOS.findIndex(t => t._id === id);

    if (index === -1) return res.status(404).send();

    TODOS[index] = {
        ...TODOS[index],
        ...req.body,
        _id: id
    };

    res.json(TODOS[index]);
});

router.delete('/todos/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const index = TODOS.findIndex(t => t._id === id);

    if (index === -1) return res.status(404).send();

    TODOS.splice(index, 1);

    res.status(204).send();
});

export default router;