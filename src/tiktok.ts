import { cac } from "cac";
import dotenv from "dotenv";
import downloadPostsOfProfile from "utils/tiktok/posts";

dotenv.config();

const parsed = cac().parse();

const startScraper = async () => {
  for (const profile of parsed.args) {
    await downloadPostsOfProfile(profile);
  }
};

startScraper();
