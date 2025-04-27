/**
 *
 * Endpoints of the API
 *
 */

import Router from "express";
import AppController from "../controllers/AppController";

// define a router
const router = Router();

// GET /status => AppController.getStatus
router.get('/status', AppController.getStatus);
// GET /stats => AppController.getStats
router.get('/stats', AppController.getStats);

export default router;
