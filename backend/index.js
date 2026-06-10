import express from 'express';
import cors from 'cors';
import apiRouter from './api.js';

const app = express();

app.use(express.static('../frontend'));
app.use(express.json());

app.use('/api', apiRouter);

app.listen(3000, () => {
    console.log("Server läuft auf http://localhost:3000");
});