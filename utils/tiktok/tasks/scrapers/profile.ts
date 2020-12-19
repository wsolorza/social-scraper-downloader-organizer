/* eslint-disable no-param-reassign */
import delay from "delay";
import * as fs from "fs-extra";
import { Listr, ListrTask } from "listr2";
import { isNil } from "lodash";
import { Headers } from "tiktok-scraper";
import { TypeVideo } from "@/utils/tiktok/interfaces/posts";
import downloadFile from "@/utils/tiktok/utils/downloadFile";
import {
  existsVideo,
  getPathFolderProfile,
  getPathFolderProfileTrash,
  getPathOfTrashVideo,
  getPathOfVideo,
} from "@/utils/tiktok/utils/paths";
import { scrapePost } from "@/utils/tiktok/utils/scraper";

const downloadVideo = (
  headers: Headers,
  folderDir: string,
  folderTrashDir: string,
  postId: string,
  type: TypeVideo,
  url: string
): ListrTask => ({
  title: `Download file with ID ${postId}`,
  task: async () => {
    const destination = getPathOfVideo(folderDir, postId, type);

    let sizeDownloaded: null | number = null;
    if (fs.existsSync(destination)) {
      sizeDownloaded = fs.statSync(destination).size;
    }

    try {
      const data = await downloadFile(
        headers,
        url,
        folderDir,
        folderTrashDir,
        postId,
        type,
        sizeDownloaded
      );

      if (data === "skip") {
        throw new Error("Skipped by Size");
      } else if (data === "zero-size") {
        throw new Error("Skipped by Zero Size");
      } else if (
        type === "advanceplus" &&
        existsVideo(folderDir, postId, "advance")
      ) {
        fs.moveSync(
          getPathOfVideo(folderDir, postId, "advance"),
          getPathOfTrashVideo(folderTrashDir, postId, "advance")
        );
      } else if (
        type === "advanceplus" &&
        existsVideo(folderDir, postId, "normal")
      ) {
        fs.moveSync(
          getPathOfVideo(folderDir, postId, "normal"),
          getPathOfTrashVideo(folderTrashDir, postId, "normal")
        );
      } else if (
        type === "advance" &&
        existsVideo(folderDir, postId, "normal")
      ) {
        fs.moveSync(
          getPathOfVideo(folderDir, postId, "normal"),
          getPathOfTrashVideo(folderTrashDir, postId, "normal")
        );
      }
    } catch (error) {
      if (error.code === "ECONNABORTED") {
        throw new Error("Timeout");
      }

      throw error;
    }
  },
});

const scraperByType = (
  profile: string,
  folderDir: string,
  folderTrashDir: string,
  type: TypeVideo,
  session: string
): ListrTask => ({
  title: `Scraping ${type}`,
  task: async (ctx, task) => {
    await delay(60 * 1000);

    const listr = new Listr([], {
      concurrent: 1,
      exitOnError: false,
      rendererOptions: {
        collapse: false,
        collapseErrors: false,
        collapseSkips: false,
        showSubtasks: true,
      },
    });

    const posts = await scrapePost(profile, type, session);

    task.title = `Found ${posts.collector.length} videos`;

    posts.collector.forEach((post) => {
      if (
        type === "advanceplus" ||
        (type === "advance" &&
          !existsVideo(folderDir, post.id, "advanceplus")) ||
        (type === "normal" &&
          !existsVideo(folderDir, post.id, "advanceplus") &&
          !existsVideo(folderDir, post.id, "advance"))
      ) {
        if (type === "advanceplus") {
          if (!isNil(post.videoUrlNoWaterMark)) {
            listr.add(
              downloadVideo(
                posts.headers,
                folderDir,
                folderTrashDir,
                post.id,
                type,
                post.videoUrlNoWaterMark
              )
            );
          }
        } else {
          listr.add(
            downloadVideo(
              posts.headers,
              folderDir,
              folderTrashDir,
              post.id,
              type,
              post.videoUrl
            )
          );
        }
      } else {
        //
      }
    });

    return listr;
  },
});

const scraperProfile = (profile: string, session: string): ListrTask => ({
  title: `Scraping ${profile}`,
  task: () => {
    const folderDir = getPathFolderProfile(profile);
    const folderTrashDir = getPathFolderProfileTrash(profile);

    fs.ensureDirSync(folderDir);
    fs.ensureDirSync(folderTrashDir);

    return new Listr(
      [
        scraperByType(profile, folderDir, folderTrashDir, "advance", session),
        scraperByType(profile, folderDir, folderTrashDir, "normal", session),
      ],
      {
        concurrent: 1,
        exitOnError: false,
        rendererOptions: {
          collapse: false,
          collapseErrors: false,
          collapseSkips: false,
          showSubtasks: true,
        },
      }
    );
  },
});

const scraperProfiles = (
  profiles: readonly string[],
  session: string
): ListrTask => ({
  title: "Scraping profiles",
  task: () => {
    const listr = new Listr([], {
      concurrent: 1,
      exitOnError: false,
      rendererOptions: {
        collapse: false,
        collapseErrors: false,
        collapseSkips: false,
        showSubtasks: true,
      },
    });

    profiles.forEach((profile) => {
      listr.add(scraperProfile(profile, session));
    });

    return listr;
  },
});

export default scraperProfiles;
