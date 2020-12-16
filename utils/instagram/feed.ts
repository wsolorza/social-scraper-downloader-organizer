import { getDate, getMonth, getYear, subDays } from "date-fns";
import executeCommand from "@/utils/instagram/utils/command";
import getPathFolder from "@/utils/instagram/utils/paths";

const downloadFeed = (altAccount: boolean = false) => {
  const folder = getPathFolder();

  const date = subDays(new Date(), 3);
  const dateFilter = `${getYear(date)}, ${getMonth(date) + 1}, ${getDate(
    date
  )}`;

  const commandData: string[] = [
    `instaloader :feed --dirname-pattern="{profile}\\posts" --post-filter="date_utc >= datetime(${dateFilter})" --no-captions --no-video-thumbnails --request-timeout=300`,
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

  executeCommand(folder, commandData.join(" "));
};

export default downloadFeed;
