import pg from 'pg';
import fs from 'fs'; 
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DataAccess {
    constructor() {
        if (DataAccess.instance) {
            return DataAccess.instance;
        }

        try {
            const queriesPath = path.join(__dirname, 'querys.json');
            const queryData = fs.readFileSync(queriesPath, 'utf8');
            this.queries = JSON.parse(queryData);
            console.log('Archivo de consultas (querys.json) cargado exitosamente.');
        } catch (error) {
            console.error("Error crítico al cargar querys.json:", error);
            process.exit(1); 
        }

        this.pool = new Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_DATABASE,
            password: process.env.DB_PASSWORD,
            port: parseInt(process.env.DB_PORT, 10),
        });

        this.pool.on('error', (err) => {
            console.error('Error inesperado en el cliente de la base de datos', err);
        });

        DataAccess.instance = this;
    }

    /**
     * Ejecuta una consulta SQL nombrada desde querys.json.
     * @param {string} queryName - El nombre (clave) de la consulta en querys.json.
     * @param {Array} params - Los parámetros para la consulta.
     * @returns {Promise<object>} El resultado de la consulta.
     */
    async exe(queryName, params) {
        const queryString = this.queries[queryName];
        if (!queryString) {
            throw new Error(`Query no encontrada en querys.json: ${queryName}`);
        }

        const client = await this.pool.connect();
        try {
            return await client.query(queryString, params);
        } finally {
            client.release();
        }
    }
    
    async getClient() {
        return this.pool.connect();
    }
}

const instance = new DataAccess();
export default instance;