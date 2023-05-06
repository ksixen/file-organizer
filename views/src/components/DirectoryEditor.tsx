import React, { useRef } from "react";
import { API } from "../api";

const pathRegex = /^(?:[\w]\:|\/)(\/[a-z_\-\s0-9\.\/]+)+/i;
function createErrorAlert(message: string) {
  const alertsWrapper = document.getElementById("alerts_wrapper");
  const wrapperElement = document.createElement("div");
  wrapperElement.classList.add("alert");
  wrapperElement.innerHTML = `
            <span
                class="close-btn"
                onclick="this.parentElement.style.display='none';"
                >&times;</span
            >
            ${message}.
`;
  if (alertsWrapper) {
    alertsWrapper.appendChild(wrapperElement);
    setTimeout(() => {
      alertsWrapper.removeChild(wrapperElement);
    }, 5000);
  } else {
    console.error("Error! alertsWrapper is null");
  }
}
const DirectoryEditor = React.memo((props: { currentDirectory: string }) => {
  const { currentDirectory } = props;
  const pathRef = useRef('');
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pathRegex.test(pathRef.current)) {
      const req = new API().changeDirectoryPath(pathRef.current);

      req.then((res) => {
        if (res?.error) {
          createErrorAlert(res.response);
        }
      });
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    pathRef.current = e.target.value;
  };
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        onChange={handleChange}
        defaultValue={currentDirectory}
        id="directory-path"
        placeholder="C:/Your Directory/"
      />
      <button type="submit">Update directory path!</button>
    </form>
  );
});
export default DirectoryEditor;
