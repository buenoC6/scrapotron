import dotenv from 'dotenv';
import axios from 'axios';
import cron from 'node-cron';
import nodemailer from 'nodemailer';

dotenv.config();

const keywords = process.env.KEYWORDS?.split(',') ?? [];

let lastItemIds: Set<number> = new Set();

cron.schedule('*/5 * * * *', async () => {
    for (const keyword of keywords) {
        await checkVinted(keyword.trim());
    }
});

async function checkVinted(keyword: string): Promise<void> {
    const url = `https://www.vinted.fr/api/v2/catalog/items?search_text=${encodeURIComponent(keyword)}&order=newest_first`;

    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'fr-FR,fr;q=0.9',
        'Origin': 'https://www.vinted.fr',
        'Referer': 'https://www.vinted.fr/',
    };

    try {
        const { data } = await axios.get(url, { headers });
        const items = data.items;

        if (!Array.isArray(items)) return;

        for (const item of items) {
            if (!lastItemIds.has(item.id)) {
                lastItemIds.add(item.id);
                const title = item.title;
                const price = item.price;
                const link = `https://www.vinted.fr${item.path}`;

                const message = `Nouvelle annonce Vinted :\n${title}\nPrix : ${price} €\n${link}`;
                console.log(message);
                sendEmail(message);
            }
        }

        if (lastItemIds.size > 50) {
            lastItemIds = new Set([...lastItemIds].slice(-50));
        }

    } catch (err) {
        console.error("Erreur avec Vinted :", (err as Error).message);
    }
}

function sendEmail(message: string): void {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    transporter.sendMail({
        from: process.env.EMAIL,
        to: process.env.TO_EMAIL,
        subject: 'Nouvelle annonce Vinted détectée',
        text: message
    }, (err, info) => {
        if (err) console.error(err);
        else console.log("Email envoyé :", info.response);
    });
}
