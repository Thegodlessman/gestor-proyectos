import express from 'express';
import cors from 'cors';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';

import dataAccess from './src/data/DataAccess.js'; 
import security from './src/security/Security.js'; 

import authRoutes from './src/routes/auth.routes.js';
import createToProcessRouter from './src/routes/toProcess.routes.js';
import securityRoutes from './src/routes/security.routes.js'
import profileRoutes from './src/routes/profile.routes.js';

import { startDeadlineChecker } from './src/jobs/deadLineChecker.js';

const app = express();

const startServer = async () => {
    try {

        await security.loadAllPermissions();

        app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
        app.use(express.json());

        const PgStore = connectPgSimple(session);
        const sessionStore = new PgStore({ pool: dataAccess.pool, tableName: 'session' });
        app.use(session({
            store: sessionStore,
            secret: process.env.SESSION_SECRET,
            resave: false,
            saveUninitialized: false,
            cookie: {
                maxAge: 1000 * 60 * 60 * 24,
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
                sameSite: 'lax'
            }
        }));

        app.use('/api/auth', authRoutes);
        app.use('/api/profile', profileRoutes);
        app.use('/security', securityRoutes);
        
        app.use('/toProcess', createToProcessRouter(security));

        const PORT = process.env.PORT || 3001;
        app.listen(PORT, () => {
            console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
            startDeadlineChecker();
        });

    } catch (error) {
        console.error('Fallo al iniciar el servidor:', error);
    }
};

startServer();