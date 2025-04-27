/**
 *
 * Definition of the endpoints related to users
 *
 */

import sha1 from 'sha1';
import Queue from 'bull';
import dbClient from "../utils/db";

// create a new queue and connect it to local Redis server
const userQueue = new Queue('userQueue', 'redis://127.0.0.1:6379');

class UsersController {
  /**
   * Create a new user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async postNew(req, res) {
    try {
      // get email & password from request body
      const { email } = req.body;
      const { password } = req.body;

      // validate required fields
      if (!email) {
        return res.status(400).json({ error: 'Missing email' });
      }

      if (!password) {
        return res.status(400).json({ error: 'Missing password' });
      }

      // wait for database connection
      try {
        await dbClient.waitConnection();
      } catch (connectionError) {
        console.error('Database connection error:', connectionError);
        return res.status(500).json({ 
          error: 'Database connection failed', 
          details: connectionError.message 
        });
      }

      // get the users collection
      const users = dbClient.db.collection('users');

      // check if user already exists
      const existingUser = await users.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Already exist' });
      }

      // create new user
      const hashedPassword = sha1(password);
      
      // insert user with async/await
      const result = await users.insertOne({
        email,
        password: hashedPassword,
      });

      // return successful response
      res.status(201).json({ 
        id: result.insertedId, 
        email 
      });

      // add a job to userQueue for any post-registration processing
      userQueue.add({ userId: result.insertedId });
      
    } catch (error) {
      // handle any unexpected errors
      console.error('Error creating user:', error);
      return res.status(500).json({ 
        error: 'Failed to create user',
        details: error.message 
      });
    }
  }
}

export default UsersController;
