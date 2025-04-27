/**
 *
 * Express server
 *
 */

import express from "express";
import dotenv from "dotenv";
dotenv.config();

// define an Express app
const app = express();

// port: from the environment variable PORT
// default: 5000
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
