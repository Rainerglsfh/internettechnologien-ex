import express from 'express';
const router = express.Router();

/**
 * Beispiel: zusätzliche Route (Erweiterung der Aufgabe)
 * z. B. Status-Statistik oder Filter
 */

router.get('/info', (req, res) => {
    res.json({
        message: "API Erweiterung aktiv"
    });
});

export default router;