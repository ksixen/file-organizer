import fs from "fs";
import path from "path";

const configFilePath = "./types.json";

export function tryCatcher(func, onError) {
  const data = {
    value: null,
  };
  try {
    data.value = func();
  } catch (error) {
    onError(error);
  }
  return data.value;
}
export function checkFolderExists(folderPath, onError) {
  return tryCatcher(() => {
    const stat = fs.lstatSync(folderPath);
    if (stat.isDirectory()) {
      return true;
    } else {
      return false;
    }
  }, onError);
}

export function getConfig() {
  const value = tryCatcher(
    function () {
      return JSON.parse(
        fs.readFileSync(configFilePath, {
          encoding: "utf-8",
        })
      );
    },
    function () {
      const defaultConf = {
        folders: [],
        byDate: true,
        path: ".",
      };
      fs.writeFileSync(configFilePath, JSON.stringify(defaultConf), {
        encoding: "utf-8",
      });
      return defaultConf;
    }
  );
  return value;
}
export function updateConfig(value) {
  fs.writeFile(configFilePath, JSON.stringify(value), "utf-8", (err) => {
    console.log(err);
  });
}

export const getExistedFiles = (obj) => {
  const dirFiles = tryCatcher(
    () => (obj.path ? fs.readdirSync(obj.path) : []),
    (err) => console.log(err)
  );
  const regexp = /\.([\w-]+)$/;
  if (!dirFiles || !dirFiles[0]) return [];
  return [
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
          if (extension) {
            const folderExist = obj.folders.findIndex((v) =>
              extension ? v.ext === extension[1] : false
            );
            return folderExist > -1 ? null : extension[1];
          } else return null;
        } else {
          return null;
        }
      })
    ),
  ].filter((i) => !!i);
};
