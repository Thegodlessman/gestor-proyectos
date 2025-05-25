import pg from 'pg'

export const pool = new pg.pool({
    user: process.env.DB_USER, 
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE, 
    port: process.env.DB_PORT
})