import express from 'express';
import { uploadProfileImage, getProfileImage } from '../controllers/profile.controller.js';
import { isAuthenticated } from '../middleware/auth.middleware.js';

const router = express.Router();

// Ruta para que el usuario logueado SUBA/ACTUALICE su propia imagen
router.post('/image', isAuthenticated, uploadProfileImage);

// Ruta para que el usuario logueado OBTENGA su propia imagen
router.get('/image', isAuthenticated, getProfileImage);

// Ruta para OBTENER la imagen de cualquier usuario por su ID
router.get('/image/:userId', isAuthenticated, getProfileImage);

export default router;