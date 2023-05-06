import { IFolder } from "./App";
import { State } from "./store/configStore";

export class API {
    useRequest<T>(method: string, path: string, params?: unknown): Promise<T> {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const localhostURL = `${window.location.protocol}//${
                window.location.hostname
            }:${5000}`;
            xhr.open(method, `${localhostURL}${path ? path : ""}`);
            xhr.onload = () => resolve(JSON.parse(xhr.responseText));
            xhr.onerror = () => reject(xhr.responseText);
            xhr.setRequestHeader(
                "Content-Type",
                "application/json;charset=UTF-8",
            );

            if (params) {
                xhr.send(JSON.stringify(params));
            } else xhr.send();
        });
    }
    changeExtensions(folders: IFolder[]) {
        return this.useRequest("POST", `/paths`, folders);
    }
    getConfig() {
        return this.useRequest<State>("GET", `/config`);
    }
    updateFiles() {
        return this.useRequest("POST", `/`);
    }

    changeDirectoryPath(path: string) {
        return this.useRequest<{ error?: string; response: string }>(
            "POST",
            `/change`,
            {
                path: path,
            },
        );
    }
}
