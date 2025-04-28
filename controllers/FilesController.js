/**
 *
 * Definition of the endpoints related to files
 *
 */

import { ObjectId } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import { promises as fs } from "fs";
import Queue from "bull";
import dbClient from "../utils/db.js";
import redisClient from "../utils/redis.js";
import dotenv from "dotenv";
dotenv.config();

const fileQueue = new Queue("fileQueue", "redis://127.0.0.1:6379");

class FilesController {
  static async getUser(req) {
    const token = req.header("X-Token");
    // if no token return null

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    // if token does not exist in Redis (or expired) return null
    if (!userId) return null;

    // token exists, get the user info from MongoDB
    const users = dbClient.db.collection("users");
    const idObject = new ObjectId(userId);
    const user = await users.findOne({ _id: idObject });

    if (!user) return null;

    return user;
  }

  static async postUpload(req, res) {
    // get the user based on the token
    const user = await FilesController.getUser(req);

    // if user not found return unauthorized
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // get the props of the file to be created from the request body
    const { name } = req.body;
    const { type } = req.body;
    const { parentId } = req.body;
    const isPublic = req.body.isPublic || false;
    const { data } = req.body;

    // validate the required parameters
    if (!name) return res.status(400).json({ error: "Missing name" });
    if (!type) return res.status(400).json({ error: "Missing type" });
    if (!data && type !== "folder")
      return res.status(400).json({ error: "Missing data" });

    // get the files collection from MongoDB
    const files = dbClient.db.collection("files");

    // if parentId is set
    if (parentId) {
      const idObject = new ObjectId(parentId);
      // if no file in the db return an error
      const file = await files.findOne({ _id: idObject, userId: user._id });
      if (!file) return res.status(400).json({ error: "Parent not found" });

      // if file in db for this parendId is not a folder return an error
      if (file.type !== "folder") {
        return res.status(400).json({ error: "Parent is not a folder" });
      }
    }

    if (type == "folder") {
      // add the new file document in the db
      files
        .insertOne({
          userId: user._id, // user ID added to the document saved in DB - as owner of a file
          name,
          type,
          parentId: parentId || 0, // ID of the parent (default: 0 -> the root)
          isPublic,
        })
        .then((result) =>
          res.status(201).json({
            id: result.insertedId,
            userId: user._id,
            name,
            type,
            isPublic,
            parentId: parentId || 0,
          }),
        )
        .catch((error) => {
          console.error(error);
        });
    } else {
      // file will be stored locally in a folder
      const filePath = process.env.FOLDER_PATH || "/tmp/files_manager";
      // create a local path in the storing folder with filename a UUID
      const fileName = `${filePath}/${uuidv4()}`;
      // store the file in clear (data contains the Base64 of the file)
      // in this local path
      const buff = Buffer.from(data, "base64");
      try {
        // try {
        //   await fs.mkdir(filePath);
        // } catch (error) {
        //   // pass. Error raised when file already exists
        // }
        // await fs.writeFile(fileName, buff);
        await fs.mkdir(filePath, { recursive: true });
      } catch (error) {
        console.log(error);
      }

      // add the new file document in the collection files
      try {
        const result = await files.insertOne({
          userId: user._id, // ID of the owner document (owner from the authentication)
          name, // same as the value received
          type, // same as the value received
          isPublic, // same as the value received
          parentId: parentId || 0, // same as the value received - if not present: 0
          localPath: fileName, // if type !== 'folder'
        });

        res.status(201).json({
          id: result.insertedId,
          userId: user._id,
          name,
          type,
          isPublic,
          parentId: parentId || 0,
        });

        if (type === "image") {
          fileQueue.add({
            userId: user._id,
            fileId: result.insertedId,
          });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Cannot save file" });
      }
    }
    return null;
  }
}

export default FilesController;
