import React, { useCallback, useRef, useState } from "react";
import { IFolder } from "../App";
import { CheckmarkIcon, RemoveIcon } from "../icons";

const ListItem = React.memo(
    (props: {
        item: IFolder;
        updateFolder?: (folder: IFolder) => void;
        removeFolder?: (id: string) => void;
        addFolder?: (folder: IFolder) => void;
    }) => {
        const { item, updateFolder, removeFolder, addFolder } = props;
        const [changed, setChanged] = useState<string[]>([]);
        const folderInputRef = useRef<HTMLInputElement>(null);
        const extInputRef = useRef<HTMLInputElement>(null);
        const handleRemove = () => {
            if (!removeFolder) return false;
            removeFolder(String(item?.id));
        };
        const handleChange = () => {
            const extensionName = extInputRef.current?.value;
            const folderName = folderInputRef.current?.value;
            if (extensionName && folderName) {
                const folder = {
                    ext: extensionName,
                    folder: folderName,
                    id: item?.id,
                };
                if (updateFolder) {
                    updateFolder(folder);
                } else if (
                    (changed.length === 1 || extensionName?.length > 0) &&
                    addFolder
                ) {
                    addFolder(folder);
                    folderInputRef.current.value = "";
                    extInputRef.current.value = "";
                }
                setChanged([]);
            }
        };

        const handleInputChange = useCallback(
            (type: string) => {
                return ({ target }: React.ChangeEvent<HTMLInputElement>) => {
                    setChanged((prev) => {
                        const sett = new Set(prev);
                        const isChanged = target.value !== item.folder;
                        isChanged ? sett.add(type) : sett.delete(type);
                        return [...sett];
                    });
                };
            },
            [item.folder],
        );
        return (
            <tr key={item.id}>
                <td>
                    <input
                        defaultValue={item.ext}
                        placeholder="Enter extension name"
                        onChange={handleInputChange("ext")}
                        ref={extInputRef}
                    />
                </td>
                <td>
                    <input
                        placeholder="Enter folder name"
                        ref={folderInputRef}
                        defaultValue={item.folder}
                        onChange={handleInputChange("folder")}
                    />
                </td>
                <td>
                    <button
                        className={"btn-icon"}
                        onClick={handleChange}
                        data-id={item.id}
                        disabled={!changed.length}
                    >
                        <CheckmarkIcon />
                    </button>
                    {removeFolder && (
                        <button className="absolute" onClick={handleRemove}>
                            <RemoveIcon />
                        </button>
                    )}
                </td>
            </tr>
        );
    },
);
export default ListItem;
