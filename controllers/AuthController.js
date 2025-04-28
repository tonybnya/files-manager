/**
 *
 * Definition of the endpoints for Authentication
 *
 */

import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import dbClient from "../utils/db";
import redisClient from "../utils/redis";

class AuthController {
  static async getConnect(req, res) {
    const authData = req.header("Authorization");

    if (!authData) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    let userEmail = authData.split(" ")[1];
    const buff = Buffer.from(userEmail, "base64");
    userEmail = buff.toString("ascii");

    const data = userEmail.split(":");

    if (data.length !== 2) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const email = data[0];
    const password = data[1];
    const users = dbClient.db.collection("users");

    // find the user by email
    const user = await users.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // compare the password with bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      // password is correct, generate token
      const token = uuidv4();
      const key = `auth_${token}`;

      // set the token in Redis with a 24-hour expiration
      console.log("Setting token in Redis:", key);
      await redisClient.set(key, user._id.toString(), 60 * 60 * 24);
      return res.status(200).json({ token });
    }

    // incorrect password
    return res.status(401).json({ error: "Unauthorized" });
  }

  static async getDisconnect(req, res) {
    const token = req.header("X-Token");
    const key = `auth_${token}`;

    const id = await redisClient.get(key);
    if (id) {
      await redisClient.del(key);
      return res.status(204).json({});
    }

    return res.status(401).json({ error: "Unauthorized" });
  }
}

export default AuthController;
