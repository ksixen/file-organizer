// Setting up our app requirements
import express from "express";
const app = express();
import { Server } from "http";
const server = new Server(app);
import path from "path";
import fs from "fs";
import bodyParser from "body-parser";
import files from "./types.json" assert { type: "json" };

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
/** Using free existed port, just for sure it doesn't hurt other apps🥺 */
const port = 5000;
import cors from "cors";
import open from "open";
const corsOptions = {
    origin: "*",
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200,
};

const pathRegex = /((?:[\w]\:|\/)(\/[a-z_\-\s0-9\.\/]+)+)/i;
// Setting up our port

const listener = server.listen(port, () =>
    console.log(
        `Server started on: http://localhost:${listener.address().port}`
    )
);

// Configuiring simple express routes
// getDir() function is used here along with package.json.pkg.assets
const tryCatcher = (func, onError) => {
    const data = {
        value: null,
    };
    try {
        data.value = func();
    } catch (error) {
        onError(error);
    }
    return data.value;
};
const checkFolderExists = (folderPath, onError) => {
    return tryCatcher(() => {
        const stat = fs.lstatSync(folderPath);
        if (stat.isDirectory()) {
            return true;
        } else {
            return false;
        }
    }, onError);
};
app.use(cors(corsOptions));
app.get("/files", (req, res) => {
    const obj = JSON.parse(JSON.stringify(files));
    const dirFiles = tryCatcher(
        () => fs.readdirSync(obj.path),
        (err) => console.log(err)
    );
    const regexp = /\.([a-zA-Z1-90]+)+$/;
    const _array = Array.from(dirFiles)
        .map((dir) => {
            const file = tryCatcher(() => {
                const stat = fs.lstatSync(path.join(obj.path, dir));
                const isFile = stat.isFile();
                if (isFile) {
                    return dir;
                } else {
                    return null;
                }
            });
            if (file) {
                return regexp.exec(`${dir}`)[1];
            } else {
                return null;
            }
        })
        .filter((i) => !!i);
    res.status(200).send(_array);
});
app.post("/change", (req, res) => {
    const body = req.body;
    const onError = () => {
        console.trace();
        res.status(400).send("bad news(((");
        return;
    };
    if (body.path && !pathRegex.test(body.path)) {
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
        const value = JSON.parse(JSON.stringify(files));
        value.path = body.path;

        writeFile("./types.json", JSON.stringify(value), "utf-8", (err) => {
            console.log(err);
        });
        res.status(200).send({ response: true });
    }
});
app.get("/config", (req, res) => {
    const obj = JSON.parse(JSON.stringify(files));
    const dirFiles = tryCatcher(
        () => fs.readdirSync(obj.path),
        (err) => console.log(err)
    );
    const regexp = /\.([\w-]+)$/;
    const _array = [
        ...new Set(
            dirFiles.map((dir, index) => {
                const file = tryCatcher(
                    () => {
                        const stat = fs.lstatSync(path.join(obj.path, dir));
                        const isFile = stat.isFile();
                        if (isFile) {
                            return dir;
                        } else {
                            return null;
                        }
                    },
                    () => {}
                );
                if (file) {
                    const extension = regexp.exec(`${dir}`);
                    const folderExist = obj.folders.findIndex(
                        (v) => v.ext === extension[1]
                    );
                    return folderExist > -1 ? null : extension[1];
                } else {
                    return null;
                }
            })
        ),
    ].filter((i) => {
        console.log(i);
        return !!i;
    });

    res.status(200).send({
        ...files,
        existingFiles: _array,
    });
});
app.post("/paths", (req, res) => {
    const body = req.body;
    const onError = () => {
        console.trace();
        res.status(400).send("bad news(((");
        return;
    };
    const value = JSON.parse(JSON.stringify(files));
    value.folders = body;

    console.log(body, value);
    fs.writeFile("./types.json", JSON.stringify(value), "utf-8", (err) => {
        console.log(err);
    });
    res.status(200).send({ response: true });
});
app.post("/", (req, res) => {
    const onError = () => {
        // console.log(error, errorDirFiles);
        res.status(400).send("bad news(((");
        return;
    };
    const value = tryCatcher(
        () =>
            fs.readFileSync("./types.json", {
                encoding: "utf8",
            }),
        onError
    );
    const plainObject = JSON.parse(value);
    const dirFiles = tryCatcher(
        () => fs.readdirSync(plainObject.path),
        onError
    );

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
    await open("https://file-organizer-kovfqkc1j-ksixen.vercel.app/", {
        app: "file-organizer",
        wait: true
    });
})();
