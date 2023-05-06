import React, { useCallback, useEffect, useMemo } from "react";
import { IFolder } from "../App";
import { API } from "../api";
import ListItem from "./ExtensionsListItem";
import { useConfigStore } from "../store/configStore";
import DirectoryEditor from "./DirectoryEditor";

const ExtensionsSettings = React.memo(() => {
    const {
        path,
        existingFiles,
        folders,
        updateFolder,
        removeFolder,
        init,
        addFolder,
        updateExistingFiles
    } = useConfigStore();
    const handleSubmit = () => {
        new API().changeExtensions(folders);
    };
    useEffect(() => {
        new API().getConfig().then((res) => {
            init(res);
        });
    }, [init]);

    const mapper = useCallback(
        (key: IFolder) => {
            return (
                <ListItem
                    key={key.id}
                    item={key}
                    removeFolder={removeFolder}
                    updateFolder={updateFolder}
                />
            );
        },
        [removeFolder, updateFolder],
    );
    const header = (
        <header>
            <h3>Files sorting settings</h3>
            <p>App thats will help you with organizing files</p>
        </header>
    );
    const existingFilesHeader = useMemo(() => {
        if (existingFiles.length == 0) return <></>;
        return (
            <tr>
                <td>
                    <strong>Existing files in current directory</strong>
                </td>
            </tr>
        );
    }, [existingFiles.length]);
    return (
        <>
            {header}
            <section>
                <div>
                    <h4>Folder names for the extensions</h4>
                    <table>
                        <thead>
                            <tr>
                                <td>
                                    <strong>Extension</strong>
                                </td>
                                <td>
                                    <strong>Folder name</strong>
                                </td>
                            </tr>
                        </thead>
                        <tbody>
                            {folders.map(mapper)}
                            {existingFilesHeader}
                            {existingFiles.map((val) => (
                                <ListItem
                                    key={val}
                                    item={{ ext: val, folder: "", id: "0" }}
                                    addFolder={addFolder}
                                />
                            ))}
                            <ListItem
                                item={{ ext: "", folder: "", id: "0" }}
                                addFolder={addFolder}
                            />
                        </tbody>
                    </table>
                    <div className="tfoot">
                        <button className="green-btn" onClick={handleSubmit}>
                            Save!
                        </button>
                    </div>
                    <br />
                </div>
            </section>
            <DirectoryEditor
                currentDirectory={path}
                updateExistingFiles={updateExistingFiles}
            />
        </>
    );
});
export default ExtensionsSettings;
