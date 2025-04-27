/**
 *
 * Definition of the endpoints to check the status of MongoDB and Redis
 * and get the stats (number of files and users in the database)
 *
 */

import dbClient from "../utils/db";
import redisClient from "../utils/redis";

class AppController {
  // GET /status
  static getStatus(req, res) {
    // check if MongoDB and Redis are alive
    // return the response with status code 200
    res.status(200).json({
      db: dbClient.isAlive(),
      redis: redisClient.isAlive(),
    });
  }

  // GET /stats
  static async getStats(req, res) {
    // get the number of files in the db
    const nbFiles = await dbClient.nbFiles();
    // get the number of users in the db
    const nbUsers = await dbClient.nbUsers();

    // return stats with status code 200
    res.status(200).json({
      files: nbFiles,
      users: nbUsers,
    });
  }
}

export default AppController;
