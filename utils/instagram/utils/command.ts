import { execSync } from "child_process";
import fs from "fs-extra";
import { consoleError, consoleInfo } from "utils/console";

const executeCommand = (folder: string, command: string) => {
  try {
    fs.ensureDirSync(folder);

    consoleInfo(`Execute command: ${command}`);

    execSync(command, {
      stdio: "inherit",
      cwd: folder,
    });
  } catch (e) {
    consoleError(e);
  }
};

export default executeCommand;
