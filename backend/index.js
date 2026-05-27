import express from 'express';
import apiRouter from './api.js';

const app = express();

app.use(express.json());

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

/* =========================
   API ROUTES (HIER BLEIBEN SIE!)
   ========================= */

app.get('/api/todos', (req, res) => {
    res.json(TODOS);
});

app.post('/api/todos', (req, res) => {
    const newTodo = {
        ...req.body,
        _id: Date.now()
    };

    TODOS.push(newTodo);
    res.status(201).json(newTodo);
});

app.put('/api/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = TODOS.findIndex(t => t._id === id);

    if (index === -1) return res.status(404).send();

    TODOS[index] = {
        ...TODOS[index],
        ...req.body,
        _id: id
    };

    res.json(TODOS[index]);
});

app.delete('/api/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = TODOS.findIndex(t => t._id === id);

    if (index === -1) return res.status(404).send();

    TODOS.splice(index, 1);

    res.status(204).send();
});

/* =========================
   API ERWEITERUNG (api.js)
   ========================= */

app.use('/api', apiRouter);

app.listen(3000, () => {
    console.log("Server läuft auf http://localhost:3000");
});