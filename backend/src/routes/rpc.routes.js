// EN: src/routes/rpcRoutes.js
import express from 'express';
import { handleRpcRequest } from '../controllers/rpc.controller.js';
import { isAuthenticated } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', isAuthenticated, handleRpcRequest); 

export default router;