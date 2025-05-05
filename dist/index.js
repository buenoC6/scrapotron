"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
const node_cron_1 = __importDefault(require("node-cron"));
const nodemailer_1 = __importDefault(require("nodemailer"));
dotenv_1.default.config();
const keywords = (_b = (_a = process.env.KEYWORDS) === null || _a === void 0 ? void 0 : _a.split(',')) !== null && _b !== void 0 ? _b : [];
let lastItemIds = new Set();
node_cron_1.default.schedule('*/5 * * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    for (const keyword of keywords) {
        yield checkVinted(keyword.trim());
    }
}));
function checkVinted(keyword) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://www.vinted.fr/api/v2/catalog/items?search_text=${encodeURIComponent(keyword)}&order=newest_first`;
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'fr-FR,fr;q=0.9',
            'Origin': 'https://www.vinted.fr',
            'Referer': 'https://www.vinted.fr/',
        };
        try {
            const { data } = yield axios_1.default.get(url, { headers });
            const items = data.items;
            if (!Array.isArray(items))
                return;
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
        }
        catch (err) {
            console.error("Erreur avec Vinted :", err.message);
        }
    });
}
function sendEmail(message) {
    const transporter = nodemailer_1.default.createTransport({
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
        if (err)
            console.error(err);
        else
            console.log("Email envoyé :", info.response);
    });
}
