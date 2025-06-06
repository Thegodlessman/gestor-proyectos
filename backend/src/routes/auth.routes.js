import express from 'express';
import { 
        login, 
        logout, 
        verificarSesion, 
        register, 
        verificarEmail,
        startPasswordReset, 
        verifySecurityAnswer, 
        finalizePasswordReset 
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout); 
router.get('/verificar', verificarSesion); 
router.post('/register', register);
router.get('/verificar-email', verificarEmail); 

router.post('/forgot-password/start', startPasswordReset);
router.post('/forgot-password/verify-answer', verifySecurityAnswer);
router.post('/forgot-password/finalize', finalizePasswordReset);

export default router;