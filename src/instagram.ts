import { cac } from "cac";
import dotenv from "dotenv";
import downloadFeed from "@/utils/instagram/feed";
import downloadHighlightsOfProfile from "@/utils/instagram/highlights";
import downloadIgtvOfProfile from "@/utils/instagram/igtv";
import downloadPostsOfProfile from "@/utils/instagram/posts";
import {
  downloadStories,
  downloadStoriesOfProfile,
} from "@/utils/instagram/stories";
import downloadTaggedOfProfile from "@/utils/instagram/tagged";

dotenv.config();

const parsed = cac().parse();

const optionStories = !!parsed.options.stories;
const optionFeed = !!parsed.options.feed;
const optionFull = !!parsed.options.full;
const optionAltAccount = !!parsed.options.altAccount;

const optionNotStories = !!parsed.options.notStories;
const optionNotHighlights = !!parsed.options.notHighlights;
const optionNotTagged = !!parsed.options.notTagged;
const optionNotIgtv = !!parsed.options.notIgtv;

const startScraper = async () => {
  if (optionStories) {
    downloadStories(optionFull, optionAltAccount);
  } else if (optionFeed) {
    downloadFeed(optionAltAccount);
  } else {
    for (const profile of parsed.args) {
      if (!optionNotStories) {
        downloadStoriesOfProfile(profile, optionFull, optionAltAccount);
        await new Promise((resolve) => setTimeout(resolve, 5 * 60 * 1000));
      }

      if (!optionNotHighlights) {
        downloadHighlightsOfProfile(profile, optionFull, optionAltAccount);
        await new Promise((resolve) => setTimeout(resolve, 5 * 60 * 1000));
      }

      if (!optionNotTagged) {
        downloadTaggedOfProfile(profile, optionFull, optionAltAccount);
        await new Promise((resolve) => setTimeout(resolve, 5 * 60 * 1000));
      }

      if (!optionNotIgtv) {
        downloadIgtvOfProfile(profile, optionFull, optionAltAccount);
        await new Promise((resolve) => setTimeout(resolve, 5 * 60 * 1000));
      }

      downloadPostsOfProfile(profile, optionFull, optionAltAccount);
    }
  }
};

startScraper();
