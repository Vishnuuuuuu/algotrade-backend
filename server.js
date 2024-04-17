const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const { MongoClient } = require('mongodb');
const { Server } = require("socket.io");

// MongoDB setup
const mongoUrl = "mongodb+srv://itsvishnups:Vishnu1232@algotrade.px09vmn.mongodb.net/?retryWrites=true&w=majority&appName=ALgoTrade";
const client = new MongoClient(mongoUrl);
const dbName = "ALgoTrade"; // Database name
const collectionName = "tradingSignals"; // Collection name

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://algotrade-frontend-six.vercel.app"], // Include Vercel app URL here
    methods: ["GET", "POST"],
    credentials: true // If your client-side code sends credentials like cookies or auth headers
  },
});

// CORS options for express
const corsOptions = {
  origin: ["http://localhost:3000", "https://algotrade-frontend-six.vercel.app"], // Include Vercel app URL here
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  //credentials: true // If your client-side code sends credentials like cookies or auth headers
};

app.use(cors(corsOptions));
app.use(cors(corsOptions));
app.use(bodyParser.json());

// MongoDB connection
async function main() {
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB server");
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Root route to verify server is running
    app.get('/', (req, res) => {
      res.send('Server is running and ready to receive webhooks!');
    });

    io.on('connection', (socket) => {
      console.log('A user connected');
    });

    // Webhook endpoint for TradingView alerts
    app.post('/webhook', async (req, res) => {
      try {
        console.log('Received webhook:', req.body);
        const today = new Date().toISOString().slice(0, 10); // format YYYY-MM-DD
        const updateResult = await collection.updateOne(
          { date: today },
          { $push: { signals: req.body } },
          { upsert: true }
        );
        console.log('MongoDB update result:', updateResult);
        io.emit('trading-signal', req.body);
        res.sendStatus(200); // Successfully received
      } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).send('Internal Server Error');
      }
    });
// Endpoint to fetch signals for today
app.get('/signals', async (req, res) => {
  const today = new Date().toISOString().slice(0, 10); // format YYYY-MM-DD
  const result = await collection.findOne({ date: today });
  if (result) {
    res.json(result.signals);
  } else {
    res.json([]); // Send an empty array if no records found
  }
});
    // Endpoint to fetch signals for a specific date
    app.get('/signals/:date', async (req, res) => {
      const date = req.params.date; // expects YYYY-MM-DD format
      const result = await collection.findOne({ date: date });
      if (result) {
        res.json(result.signals);
      } else {
        res.json([]); // Send an empty array if no records found
      }
    });

    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main().catch(console.error);
