import axios from 'axios';
import cron from 'node-cron';
import { addItem } from './storage';

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Accept': 'application/json, text/plain, */*',
    'Referer': 'https://www.vinted.fr/',
    'Origin': 'https://www.vinted.fr',
};

const keyword = 'nintendo ds';

cron.schedule('*/5 * * * * *', async () => {
    const url = `https://www.vinted.fr/api/v2/catalog/items?search_text=${encodeURIComponent(keyword)}&order=newest_first`;

    try {
        const { data } = await axios.get(url, { headers });
        const items = data.items;

        for (const item of items) {
            addItem({
                id: item.id,
                title: item.title,
                price: item.price,
                url: `https://www.vinted.fr${item.path}`,
            });
        }
    } catch (e) {
        console.error('Erreur dans le bot Vinted', (e as Error).message);
    }
});
