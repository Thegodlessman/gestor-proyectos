import express from 'express';
import cors from 'cors';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import db from './src/config/db.js'; 
import authRoutes from './src/routes/auth.routes.js';

const app = express();

// Middlewares
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de la Sesión
const PgStore = connectPgSimple(session);
const sessionStore = new PgStore({
    pool: db.getPool(), 
    tableName: 'session',
});

app.use(session({
    store: sessionStore, // Le decimos a express-session que use almacén de PG
    secret: process.env.SESSION_SECRET,
    resave: false, // No guardar la sesión si no ha cambiado
    saveUninitialized: false, // No crear sesión para usuarios que no han iniciado sesión
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24, // Duración de la cookie
        httpOnly: true, // La cookie no es accesible desde JavaScript en el frontend
    }
}));

// Rutas de la API
app.get('/api', (req, res) => {
    res.json({ message: "Bienvenido al API del Gestor de Proyectos" });
});

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server backend on port ${PORT}`);
});