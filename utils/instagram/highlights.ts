import { resolve } from "path";
import fs from "fs-extra";
import executeCommand from "@/utils/instagram/utils/command";
import getPathFolder from "@/utils/instagram/utils/paths";

const downloadHighlightsOfProfile = (
  profile: string,
  full = false,
  altAccount = false
) => {
  const folder = getPathFolder();

  const commandData: string[] = [
    `instaloader ${profile} --dirname-pattern="{profile}\\highlight\\{target}" --no-profile-pic --no-posts --highlights --no-captions --no-video-thumbnails --request-timeout=300`,
  ];

  if (altAccount) {
    commandData.push(
      `--login ${process.env.INSTAGRAM_USER_ALT} --password=${process.env.INSTAGRAM_PASSWORD_ALT}`
    );
  } else {
    commandData.push(
      `--login ${process.env.INSTAGRAM_USER} --password=${process.env.INSTAGRAM_PASSWORD}`
    );
  }

  if (!full) {
    commandData.push("--fast-update");
  }

  executeCommand(folder, commandData.join(" "));

  if (fs.pathExistsSync(resolve(folder, profile, "highlight", profile))) {
    fs.readdirSync(resolve(folder, profile, "highlight", profile)).forEach(
      (file) => {
        fs.moveSync(
          resolve(folder, profile, "highlight", profile, file),
          resolve(folder, profile, "highlight", file),
          { overwrite: true }
        );
      }
    );

    fs.removeSync(resolve(folder, profile, "highlight", profile));
  }
};

export default downloadHighlightsOfProfile;
