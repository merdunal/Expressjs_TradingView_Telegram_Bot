require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios')

const { TOKEN, SERVER_URL } = process.env
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`
const URI = `/webhook/${TOKEN}`
const WEBHOOK_URL = SERVER_URL + URI

const app = express()
app.use(bodyParser.json())

const init = async () => {
    const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`)
    console.log(res.data)
}

app.post(URI, async (req, res) => {
    console.log(req.body)

    if (req.body.tradingData) {
        const tradingData = req.body.tradingData;
        console.log('Received trading data:', tradingData);

        // Format the trading data
        const formattedData = Object.keys(tradingData)
            .map(key => `${key}: ${tradingData[key]}`)
            .join('\n');

        await axios.post(`${TELEGRAM_API}/sendMessage`, {
            chat_id: 6129229736,
            text: formattedData,
        });

        return res.send('Trading data received and sent to the Telegram bot.');
    }

    return res.status(400).send('Bad Request: No trading data found in the request.');

});

app.listen(process.env.PORT || 4040, async () => {
    console.log("app running on port", process.env.PORT || 4040)
    await init()
})