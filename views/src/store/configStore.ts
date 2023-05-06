import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { IFolder } from "../App";
import { v4 as uuidv4 } from "uuid";

export type State = {
    existingFiles: string[];
    folders: IFolder[];
    byDate: boolean;
    path: string;
};
type Actions = {
    updateFolder: (folder: IFolder) => void;
    addFolder: (folder: IFolder) => void;
    removeFolder: (id: string) => void;
    init: (state: State) => void;
    updateExistingFiles: (values: string[]) => void;
};
export const useConfigStore = create(
    immer<State & Actions>((set) => ({
        byDate: false,
        existingFiles: [],
        folders: [],
        path: "",
        init: (config) => set(config),
        updateFolder: (folder) => {
            set((state) => {
                const index = state.folders.findIndex(
                    (val) => val.id === folder.id,
                );
                if (index > -1) {
                    state.folders.splice(index, 1, folder);
                }
                return state;
            });
        },
        removeFolder: (folder) => {
            set((state) => {
                const index = state.folders.findIndex(
                    (val) => val.id === folder,
                );
                if (index > -1) {
                    state.folders.splice(index, 1);
                }
                return state;
            });
        },
        addFolder: (folder) => {
            set((state) => {
                state.folders.push({
                    ...folder,
                    id: uuidv4(),
                });
                state.existingFiles = state.existingFiles.filter(
                    (v) => v !== folder.ext,
                );
                return state;
            });
        },
        updateExistingFiles: (values) => {
            set((state) => {
                state.existingFiles = values;
                return state;
            });
        },
    })),
);
