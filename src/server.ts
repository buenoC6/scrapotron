import express from 'express';
import path from 'path';
import { getItems } from './storage';
import './bot'; // Lance le bot

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, '../public')));

app.get('/api/items', (req: any, res: any) => {
    res.json(getItems());
});

app.listen(PORT, () => {
    console.log(`Interface disponible sur http://localhost:${PORT}`);
});
