import executeCommand from "@/utils/instagram/utils/command";
import getPathFolder from "@/utils/instagram/utils/paths";

export const downloadStories = (
  full: boolean = false,
  altAccount: boolean = false
): void => {
  const folder = getPathFolder();
  const commandParts: string[] = [
    'instaloader :stories --dirname-pattern="{profile}\\stories" --no-captions --no-video-thumbnails --request-timeout=300',
  ];

  if (altAccount) {
    commandParts.push(
      `--login ${process.env.INSTAGRAM_USER_ALT} --password=${process.env.INSTAGRAM_PASSWORD_ALT}`
    );
  } else {
    commandParts.push(
      `--login ${process.env.INSTAGRAM_USER} --password=${process.env.INSTAGRAM_PASSWORD}`
    );
  }

  if (!full) {
    commandParts.push("--fast-update");
  }

  executeCommand(folder, commandParts.join(" "));
};

export const downloadStoriesOfProfile = (
  profile: string,
  full: boolean = false,
  altAccount: boolean = false
): void => {
  const folder = getPathFolder();
  const commandParts: string[] = [
    `instaloader ${profile} --dirname-pattern="{profile}\\stories" --no-profile-pic --no-posts --stories --no-captions --no-video-thumbnails --request-timeout=300`,
  ];

  if (altAccount) {
    commandParts.push(
      `--login ${process.env.INSTAGRAM_USER_ALT} --password=${process.env.INSTAGRAM_PASSWORD_ALT}`
    );
  } else {
    commandParts.push(
      `--login ${process.env.INSTAGRAM_USER} --password=${process.env.INSTAGRAM_PASSWORD}`
    );
  }

  if (!full) {
    commandParts.push("--fast-update");
  }

  executeCommand(folder, commandParts.join(" "));
};
