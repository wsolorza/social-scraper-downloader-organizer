/* eslint-disable no-param-reassign */
import delay from "delay";
import { ListrTaskWrapper } from "listr2";
import { isNil } from "lodash";
import { Context, TypePost } from "@/utils/tiktok/interfaces";
import { existsFileVideo } from "@/utils/tiktok/paths";
import scrapingVideo from "@/utils/tiktok/profile/scrapingVideo";
import { scrapePosts } from "@/utils/tiktok/scraper";

const scrapingVideoByType = async (
  task: ListrTaskWrapper<Context, any>,
  type: TypePost,
  profile: string,
  session: string
) => {
  task.output = `Scraping videos of type ${type}`;

  await delay(60 * 1000);

  const posts = await scrapePosts(profile, type, session);

  if (posts === null) {
    throw Error("Error to scrape posts");
  }

  if (posts.collector.length === 0) {
    throw Error("Empty profile");
  }

  for (const post of posts.collector) {
    if (type === "advanceplus") {
      if (!isNil(post.videoUrlNoWaterMark)) {
        await scrapingVideo(
          task,
          profile,
          posts.headers,
          post.id,
          type,
          post.videoUrlNoWaterMark
        );
      }
    } else if (type === "advance") {
      if (!existsFileVideo(profile, post.id, "advanceplus")) {
        await scrapingVideo(
          task,
          profile,
          posts.headers,
          post.id,
          type,
          post.videoUrl
        );
      }
    } else if (type === "normal") {
      if (
        !existsFileVideo(profile, post.id, "advanceplus") &&
        !existsFileVideo(profile, post.id, "advance")
      ) {
        await scrapingVideo(
          task,
          profile,
          posts.headers,
          post.id,
          type,
          post.videoUrl
        );
      }
    }
  }
};

export default scrapingVideoByType;
