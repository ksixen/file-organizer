import "./App.scss";
import { API } from "./api";
import ExtensionsSettings from "./components/ExtensionsSettings";
export type IFolder = { ext: string; folder: string; id: string };

function App() {
    const updateFiles = () => {
        new API().updateFiles();
    };
    return (
        <>
            <div id="alerts_wrapper"></div>
            <ExtensionsSettings />
            <br />
            <button className="purple-btn" onClick={updateFiles} type="submit">
                Sort Files!
            </button>
        </>
    );
}

export default App;
