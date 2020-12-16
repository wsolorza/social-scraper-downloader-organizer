import executeCommand from "@/utils/instagram/utils/command";
import getPathFolder from "@/utils/instagram/utils/paths";

const downloadPostsOfProfile = (
  profile: string,
  full = false,
  altAccount = false
) => {
  const folder = getPathFolder();

  const commandData: string[] = [
    `instaloader ${profile} --dirname-pattern="${profile}\\posts" --no-captions --no-video-thumbnails --request-timeout=300`,
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
};

export default downloadPostsOfProfile;
