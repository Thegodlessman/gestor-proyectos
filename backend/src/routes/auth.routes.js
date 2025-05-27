import express from 'express';
import { login, logout, verificarSesion, register} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout); 
router.get('/verificar', verificarSesion); 
router.post('/register', register);

export default router;