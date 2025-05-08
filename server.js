const express = require('express');
const winston = require('winston');
const { MongoClient, ObjectId } = require('mongodb'); // ✅ Fixed ObjectId import

// MongoDB connection string
const mongoUri = process.env.MONGO_URI || "mongodb://user1:12345@mongodb-service:27017";

const client = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

let db;

client.connect()
  .then(() => {
    console.log("✅ Connected to MongoDB");
    db = client.db("calculatorDb");

    // ✅ Start server only after DB is ready
    app.listen(PORT, () => {
        console.log(`Calculator microservice running at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ Error connecting to MongoDB:", err);
  });

const app = express();
const PORT = 3000;

// Create a Winston logger for logging requests
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'calculator-microservice' },
    transports: [
        new winston.transports.Console({ format: winston.format.simple() }),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
});

// Middleware to parse query parameters
app.use(express.json());

// Function to validate inputs
const validateNumbers = (num1, num2) => {
    if (isNaN(num1) || isNaN(num2)) {
        return "Invalid input: Both num1 and num2 should be numbers.";
    }
    return null;
};

// Function to save operation result to MongoDB
const saveResultToDB = async (operation, num1, num2, result) => {
    if (!db) return;
    const collection = db.collection("operations");
    const doc = { operation, num1, num2, result, timestamp: new Date() };
    await collection.insertOne(doc);
};

// API Endpoints

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Addition
app.get('/add', async (req, res) => {
    const num1 = parseFloat(req.query.num1);
    const num2 = parseFloat(req.query.num2);

    const error = validateNumbers(num1, num2);
    if (error) {
        logger.error(error);
        return res.status(400).json({ error });
    }

    const result = num1 + num2;
    logger.info(`Addition requested: ${num1} + ${num2} = ${result}`);
    await saveResultToDB("addition", num1, num2, result);
    res.json({ operation: "addition", result });
});

// Subtraction
app.get('/subtract', async (req, res) => {
    const num1 = parseFloat(req.query.num1);
    const num2 = parseFloat(req.query.num2);

    const error = validateNumbers(num1, num2);
    if (error) {
        logger.error(error);
        return res.status(400).json({ error });
    }

    const result = num1 - num2;
    logger.info(`Subtraction requested: ${num1} - ${num2} = ${result}`);
    await saveResultToDB("subtraction", num1, num2, result);
    res.json({ operation: "subtraction", result });
});

// Multiplication
app.get('/multiply', async (req, res) => {
    const num1 = parseFloat(req.query.num1);
    const num2 = parseFloat(req.query.num2);

    const error = validateNumbers(num1, num2);
    if (error) {
        logger.error(error);
        return res.status(400).json({ error });
    }

    const result = num1 * num2;
    logger.info(`Multiplication requested: ${num1} * ${num2} = ${result}`);
    await saveResultToDB("multiplication", num1, num2, result);
    res.json({ operation: "multiplication", result });
});

// Division
app.get('/divide', async (req, res) => {
    const num1 = parseFloat(req.query.num1);
    const num2 = parseFloat(req.query.num2);

    const error = validateNumbers(num1, num2);
    if (error) {
        logger.error(error);
        return res.status(400).json({ error });
    }

    if (num2 === 0) {
        logger.error("Error: Division by zero is not allowed.");
        return res.status(400).json({ error: "Division by zero is not allowed." });
    }

    const result = num1 / num2;
    logger.info(`Division requested: ${num1} / ${num2} = ${result}`);
    await saveResultToDB("division", num1, num2, result);
    res.json({ operation: "division", result });
});

// Read operations from MongoDB
app.get('/operations', async (req, res) => {
    try {
        if (!db) throw new Error("Database not initialized");
        const operations = await db.collection("operations").find().toArray();
        res.json(operations);
    } catch (error) {
        logger.error('Error fetching operations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ✅ Updated PUT endpoint to correctly use ObjectId
app.put('/operations/:id', async (req, res) => {
    try {
        const { operation, num1, num2, result } = req.body;
        const updatedOperation = await db.collection("operations").updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { operation, num1, num2, result } }
        );
        res.json(updatedOperation);
    } catch (error) {
        logger.error('Error updating operation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ✅ Updated DELETE endpoint to correctly use ObjectId
app.delete('/operations/:id', async (req, res) => {
    try {
        await db.collection("operations").deleteOne({ _id: new ObjectId(req.params.id) });
        res.status(204).send();
    } catch (error) {
        logger.error('Error deleting operation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Calculator microservice running at http://localhost:${PORT}`);
});