import express from 'express';
import { handleRequest } from '../controllers/toProcess.controller.js';

const createRouter = (securityInstance) => {
    const router = express.Router();
    
    router.post('/', (req, res) => handleRequest(req, res, securityInstance));
    return router;
};

export default createRouter;