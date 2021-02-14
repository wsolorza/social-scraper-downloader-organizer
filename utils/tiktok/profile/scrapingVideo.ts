/* eslint-disable no-param-reassign */
import * as fs from "fs-extra";
import { ListrTaskWrapper } from "listr2";
import { Headers } from "tiktok-scraper";
import { Context, TypePost } from "@/utils/tiktok/interfaces";
import {
  existsFileVideo,
  getPathFileVideo,
  getPathFileVideoTrash,
} from "@/utils/tiktok/paths";
import downloadVideo from "@/utils/tiktok/profile/downloadVideo";

const scrapingVideo = async (
  task: ListrTaskWrapper<Context, any>,
  profile: string,
  headers: Headers,
  postId: string,
  type: TypePost,
  url: string
) => {
  task.output = `Scraping video with ID ${postId}`;

  const destination = getPathFileVideo(profile, postId, type);

  let sizeDownloaded: null | number = null;
  if (fs.existsSync(destination)) {
    sizeDownloaded = fs.statSync(destination).size;
  }

  try {
    const data = await downloadVideo(
      headers,
      url,
      profile,
      postId,
      type,
      sizeDownloaded
    );

    if (data === "skip") {
      task.skip();
    } else if (data === "zero-size") {
      throw new Error("Error by Zero Size");
    } else if (
      type === "advanceplus" &&
      existsFileVideo(profile, postId, "advance")
    ) {
      fs.moveSync(
        getPathFileVideo(profile, postId, "advance"),
        getPathFileVideoTrash(profile, postId, "advance")
      );
    } else if (
      type === "advanceplus" &&
      existsFileVideo(profile, postId, "normal")
    ) {
      fs.moveSync(
        getPathFileVideo(profile, postId, "normal"),
        getPathFileVideoTrash(profile, postId, "normal")
      );
    } else if (
      type === "advance" &&
      existsFileVideo(profile, postId, "normal")
    ) {
      fs.moveSync(
        getPathFileVideo(profile, postId, "normal"),
        getPathFileVideoTrash(profile, postId, "normal")
      );
    }
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      throw new Error("Timeout");
    }

    throw error;
  }
};

export default scrapingVideo;
