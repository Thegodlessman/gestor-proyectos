import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

pool.on('error', (err) => {
    console.error('Error inesperado en el cliente de la base de datos', err);

});

const db = {
    query: (text, params) => pool.query(text, params),
    getPool: () => pool, // Renombrado de 'pool' a 'getPool' para claridad si se exporta
};

export default db;