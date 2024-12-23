import express from 'express';
const app = express();
app.use(express.json());// Middleware to parse JSON bodies
import dbConfig from './db-config/db_config.js';
const { connectToDB,pool } = dbConfig; 
connectToDB();
import url from './routes/url.js'

app.use('/url', url);


const shutdown = async () => {
    await pool.end(); // Close all connections in the pool
    console.log('Pool has been closed.');
    process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

const port = process.env.PORT || 3000;
app.listen(port, () => {
   console.log(`Listening on port ${port}`); 
});