import pg from 'pg';

const pool = new pg.Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'sector_db',
    password: '9293709',
    port: 5432, // Порт по умолчанию для PostgreSQL
});
const client = await pool.connect();

export default client;
