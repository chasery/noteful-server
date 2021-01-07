const path = require("path");
const express = require("express");
const xss = require("xss");
const FoldersService = require("./folders-service");

const foldersRouter = express.Router();
const jsonParser = express.json();

const serializeFolder = (folder) => ({
  id: folder.id,
  folder_name: xss(folder.folder_name), // sanitize folder_name
});

foldersRouter
  .route("/")
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");

    FoldersService.getAllFolders(knexInstance)
      .then((folders) => {
        res.json(folders.map(serializeFolder));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const knexInstance = req.app.get("db");
    const { folder_name } = req.body;
    const newFolder = { folder_name };

    if (!folder_name) {
      res.status(400).json({
        error: { message: `Missing 'folder_name' in request body` },
      });
    }

    FoldersService.insertFolder(knexInstance, newFolder)
      .then((folder) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${folder.id}`))
          .json(serializeFolder(folder));
      })
      .catch(next);
  });

foldersRouter
  .route("/:id")
  .all((req, res, next) => {
    const knexInstance = req.app.get("db");

    FoldersService.getFolderByID(knexInstance, req.params.id)
      .then((folder) => {
        if (!folder) {
          return res.status(404).json({
            error: { message: `Folder doesn't exist` },
          });
        }
        res.folder = folder;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeFolder(res.folder));
  })
  .delete((req, res, next) => {
    const knexInstance = req.app.get("db");

    FoldersService.deleteFolder(knexInstance, req.params.id)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const knexInstance = req.app.get("db");
    const { folder_name } = req.body;
    const folderToUpdate = { folder_name };

    if (!folder_name) {
      return res.status(400).json({
        error: {
          message: "Request body must contain 'folder_name'",
        },
      });
    }

    FoldersService.updateFolder(knexInstance, req.params.id, folderToUpdate)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = foldersRouter;
