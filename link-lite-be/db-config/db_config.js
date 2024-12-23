import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const {Pool}=pg
const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
    ssl: {
        rejectUnauthorized: false, // Use this if you encounter SSL issues
    },
});
const connectToDB = async () => {
    try {
        const connection = await pool.connect();
        console.log(`Connected to Postgresql database..`);
        connection.release();
    } catch (err) {
        console.log('Could not connect to PostgreSql...',err);
    }
}

export default {
    connectToDB,
    pool
};

