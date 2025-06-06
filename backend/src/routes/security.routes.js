import express from 'express';
import { getSecurityQuestions, setSecurityAnswer } from '../controllers/security.controller.js';
import { isAuthenticated } from '../middleware/auth.middleware.js'; 

const router = express.Router();

router.get('/questions', getSecurityQuestions);
router.post('/answers', isAuthenticated, setSecurityAnswer); 

export default router;