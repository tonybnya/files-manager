/**
 *
 * Endpoints of the API
 *
 */

import Router from "express";
import AuthController from "../controllers/AuthController.js";
import AppController from "../controllers/AppController.js";
import UsersController from "../controllers/UsersController.js";

// define a router
const router = Router();

// check status of MongoDB & Redis
// and get the number of files and users in the db
// GET /status => AppController.getStatus
router.get("/status", AppController.getStatus);
// GET /stats => AppController.getStats
router.get("/stats", AppController.getStats);

// create a new user
// POST /users => UsersController.postNew
router.post("/users", UsersController.postNew);

// authenticate a user
// GET /connect => AuthController.getConnect
router.get("/connect", AuthController.getConnect);
// GET /disconnect => AuthController.getDisconnect
router.get("/disconnect", AuthController.getDisconnect);
// GET /users/me => UserController.getMe
router.get("/users/me", UsersController.getMe);

export default router;
