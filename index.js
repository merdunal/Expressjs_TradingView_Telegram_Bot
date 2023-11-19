require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const { TOKEN, SERVER_URL } = process.env;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const URI = `/webhook/${TOKEN}`;
const WEBHOOK_URL = SERVER_URL + URI;

const app = express();
app.use(bodyParser.json());

const init = async () => {
    const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`);
    console.log(res.data);
};

app.post(URI, async (req, res) => {
    console.log(req.body);

    if (req.body) {
        const alertData = req.body;

        if (alertData.ticker) {
            // Extract relevant data from the TradingView alert
            const { ticker, close, exchange, interval } = alertData;

            // Format the message
            const formattedMessage = `<b>${ticker}</b> : ${close}\n Al Sinyali Geldi.`;

            // Telegram API request payload
            const telegramPayload = {
                chat_id: "@v1denemebot", // Replace with your Telegram group ID or channel username
                text: formattedMessage,
                parse_mode: "html",
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "Grafiğe Git",
                                url: `https://www.tradingview.com/chart/?symbol=${exchange}:${ticker}&interval=${interval}`,
                            },
                        ],
                    ],
                },
            };

            // Send the message to Telegram
            await axios.post(`${TELEGRAM_API}/sendMessage`, telegramPayload);

            return res.send('TradingView alert received and processed.');
        }
    }

    return res.status(400).send('Bad Request: Invalid or incomplete TradingView alert data.');
});


app.listen(process.env.PORT || 4040, async () => {
    console.log("app running on port", process.env.PORT || 4040);
    await init();
});
