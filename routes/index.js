/**
 *
 * Endpoints of the API
 *
 */

import Router from "express";
import AppController from "../controllers/AppController.js";
import UsersController from "../controllers/UsersController.js"

// define a router
const router = Router();

// GET /status => AppController.getStatus
router.get('/status', AppController.getStatus);
// GET /stats => AppController.getStats
router.get('/stats', AppController.getStats);


// POST /users => UsersController.postNew
router.post('/users', UsersController.postNew);

export default router;
