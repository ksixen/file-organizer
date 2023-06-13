// Setting up our app requirements
import express from "express";
const app = express();
import { Server } from "http";
const server = new Server(app);
import path from "path";
import fs from "fs";
import bodyParser from "body-parser";
import cors from "cors";
import open from "open";

import {
  checkFolderExists,
  getConfig,
  tryCatcher,
  updateConfig,
  getExistedFiles,
} from "./utils.js";

//#region CONSTANT
const APP_URL = "https://file-organizer.vercel.app/";
const PATH = {
  FILES: "/files",
  CHANGE: "/change",
  CONFIG: "/config",
  PATHS: "/paths",
};
//#endregion

//#region REGEX
const directoryPathRegex = /((?:[\w]\:|\/)(\/[a-z_\-\s0-9\.\/]+)+)/i;
const fileExtensionRegexp = /\.([a-zA-Z1-90]+)+$/;
//#endregion

//#region Express App Configuration
/** Using free existed port, just for sure it doesn't hurt other apps🥺 */
const port = 5000;
const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors(corsOptions));
//#endregion

// Setting up our port
const listener = server.listen(port, () =>
  console.log(`Server started on: http://localhost:${listener.address().port}`)
);

app.get(PATH.FILES, (req, res) => {
  const obj = getConfig();
  const dirFiles = tryCatcher(
    () => fs.readdirSync(obj.path),
    (err) => console.log(err)
  );
  const _array = Array.from(dirFiles)
    .map((filePath) => {
      const file = tryCatcher(() => {
        const stat = fs.lstatSync(path.join(obj.path, filePath));
        const isFile = stat.isFile();
        if (isFile) {
          return filePath;
        } else {
          return null;
        }
      });
      if (file) {
        return fileExtensionRegexp.exec(`${filePath}`)[1];
      } else {
        return null;
      }
    })
    .filter((i) => !!i);
  res.status(200).send(_array);
});
app.post(PATH.CHANGE, (req, res) => {
  const body = req.body;
  const onError = () => {
    console.trace();
    res.status(400).send("bad news(((");
    return;
  };
  if (body.path && !directoryPathRegex.test(body.path)) {
    onError();
  } else {
    const isPathExists = checkFolderExists(body.path, () => {});
    if (!isPathExists) {
      res.status(400).send({
        response: "Folder doesn't exists",
        error: true,
      });
      return false;
    }
    const value = getConfig();
    value.path = body.path;

    updateConfig(value);

    const _array = getExistedFiles(value);
    res.status(200).send({ response: _array });
  }
});

app.get(PATH.CONFIG, (req, res) => {
  const obj = getConfig();
  console.log(obj)
  const _array = getExistedFiles(obj);
  res.status(200).send({
    ...obj,
    existingFiles: _array,
  });
});
app.post(PATH.PATHS, (req, res) => {
  const body = req.body;
  const onError = () => {
    console.trace();
    res.status(400).send("bad news(((");
    return;
  };
  const value = getConfig();
  value.folders = body;

  updateConfig(value);
  res.status(200).send({ response: true });
});
app.post("/", (req, res) => {
  const plainObject = getConfig();
  const dirFiles = tryCatcher(() => fs.readdirSync(plainObject.path), onError);

  const _array = Array.from(dirFiles)
    .map((dir) => {
      const file = tryCatcher(() => {
        const stat = fs.lstatSync(path.join(plainObject.path, dir));
        const isFile = stat.isFile();
        if (isFile) {
          return dir;
        } else {
          return null;
        }
      });
      if (file) {
        return dir;
      } else {
        return null;
      }
    })
    .filter((i) => !!i);
  plainObject.folders.forEach((key) => {
    const folderPath = path.join(plainObject.path, key.folder);
    const isFolderExists = checkFolderExists(folderPath, () => {});
    if (!isFolderExists) {
      try {
        fs.mkdirSync(folderPath);
      } catch (error) {
        console.log(error);
      }
    }
    _array.forEach((filename) => {
      const regexp = new RegExp(`.${key.ext}+$`);
      const oldPath = path.join(plainObject.path, filename);
      const newPath = path.join(plainObject.path, key.folder, filename);
      if (regexp.test(filename)) {
        tryCatcher(
          () => fs.renameSync(oldPath, newPath),
          (err) => {
            console.log(err);
          }
        );
      }
    });
  });

  res.status(200).send({
    response: true,
  });
});

(async () => {
  await open(APP_URL, {
    app: "file-organizer",
    wait: true,
  });
})();
