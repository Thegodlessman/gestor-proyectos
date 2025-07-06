import express from 'express';
import { getPrioridades } from '../controllers/utility.controller.js';
import { isAuthenticated } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/priorities', isAuthenticated, getPrioridades);

export default router;