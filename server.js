/**
 *
 * Express server
 *
 */

import express from "express";
import dotenv from "dotenv";
import router from "./routes/index.js";
dotenv.config();

// define an Express app
const app = express();

// parse incoming JSON requests
app.use(express.json());

// increase the limit for incoming JSON body size
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// port: from the environment variable PORT
// default: 5000
const port = process.env.PORT || 5000;

// load all endpoints/routes
app.use("/", router);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
