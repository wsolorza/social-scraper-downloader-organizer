import { Queue, TypeVideo } from "@/utils/tiktok/interfaces/posts";
import downloadFile from "@/utils/tiktok/utils/downloadFile";
import { scrapePost } from "@/utils/tiktok/utils/scraper";
import wait from "@/utils/tiktok/utils/wait";
import { asyncify, forEachLimit } from "async";
import chalk from "chalk";
import * as fs from "fs-extra";
import { consoleError, consoleInfo } from "@/utils/console";
import {
  existsVideo,
  getPathFolderProfile,
  getPathFolderProfileTrash,
  getPathOfTrashVideo,
  getPathOfVideo,
} from "@/utils/tiktok/utils/paths";
import ProgressBar from "progress";
import { isNil } from "lodash";
import { getRandom } from "@/utils/tiktok/utils/userAgent";
import { makeid } from "tiktok-scraper";

const cookieId = makeid(16);
const userAgent = getRandom();

let bar = new ProgressBar(`${chalk.green(`[???]`)} :bar :current/:total`, {
  complete: "=",
  incomplete: " ",
  renderThrottle: 1,
  width: 100,
  total: 1,
});

let queues: Queue[] = [];

let downloaderCounter = {
  skipByExistsMayorVersion: 0,
  skipByZeroSize: 0,
  skipBySize: 0,
  complete: 0,
  timeout: 0,
  errors: 0,
};

const resetVariables = (): void => {
  queues = [];

  downloaderCounter = {
    skipByExistsMayorVersion: 0,
    skipByZeroSize: 0,
    skipBySize: 0,
    complete: 0,
    timeout: 0,
    errors: 0,
  };

  bar = new ProgressBar(
    `${chalk.green(`[TikTok - ???]`)} :bar :current/:total`,
    {
      complete: "=",
      incomplete: " ",
      renderThrottle: 1,
      width: 40,
      total: 1,
    }
  );
};

const processorQueue = (queue: Queue): Promise<unknown> => {
  const destination = getPathOfVideo(queue.folderDir, queue.postId, queue.type);

  let sizeDownloaded: null | number = null;
  if (fs.existsSync(destination)) {
    sizeDownloaded = fs.statSync(destination).size;
  }

  return downloadFile(
    queue.url,
    queue.folderDir,
    queue.folderTrashDir,
    queue.postId,
    queue.type,
    userAgent,
    cookieId,
    sizeDownloaded
  )
    .then((data) => {
      if (data === "skip") {
        downloaderCounter.skipBySize += 1;
      } else if (data === "zero-size") {
        downloaderCounter.skipByZeroSize += 1;
      } else {
        downloaderCounter.complete += 1;

        if (
          queue.type === "advanceplus" &&
          existsVideo(queue.folderDir, queue.postId, "advance")
        ) {
          fs.moveSync(
            getPathOfVideo(queue.folderDir, queue.postId, "advance"),
            getPathOfTrashVideo(queue.folderTrashDir, queue.postId, "advance")
          );
        } else if (
          queue.type === "advanceplus" &&
          existsVideo(queue.folderDir, queue.postId, "normal")
        ) {
          fs.moveSync(
            getPathOfVideo(queue.folderDir, queue.postId, "normal"),
            getPathOfTrashVideo(queue.folderTrashDir, queue.postId, "normal")
          );
        } else if (
          queue.type === "advance" &&
          existsVideo(queue.folderDir, queue.postId, "normal")
        ) {
          fs.moveSync(
            getPathOfVideo(queue.folderDir, queue.postId, "normal"),
            getPathOfTrashVideo(queue.folderTrashDir, queue.postId, "normal")
          );
        }
      }
    })
    .catch((error) => {
      if (error.code === "ECONNABORTED") {
        downloaderCounter.timeout += 1;
      } else {
        downloaderCounter.errors += 1;
      }
    })
    .finally(() => {
      bar.tick();
    });
};

const downloadByType = async (
  profile: string,
  folderDir: string,
  folderTrashDir: string,
  type: TypeVideo
) => {
  try {
    consoleInfo(`[${profile}] Starting scrapping of type ${type}...`);

    const posts = await scrapePost(profile, type, userAgent, cookieId);

    consoleInfo(`[${profile}] ${posts.collector.length} videos found`);

    for (const post of posts.collector) {
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
            queues.push({
              folderDir,
              folderTrashDir,
              postId: post.id,
              url: post.videoUrlNoWaterMark,
              type,
            });
          }
        } else {
          queues.push({
            folderDir,
            folderTrashDir,
            postId: post.id,
            url: post.videoUrl,
            type,
          });
        }
      } else {
        downloaderCounter.skipByExistsMayorVersion += 1;
      }
    }

    bar = new ProgressBar(
      `${chalk.green(`[${profile}]`)} :bar :current/:total`,
      {
        complete: "=",
        incomplete: " ",
        renderThrottle: 1,
        width: 100,
        total: queues.length,
      }
    );

    await forEachLimit(queues, 2, asyncify(processorQueue));
  } catch (e) {
    consoleError(`[${profile}] ${e}`);
  } finally {
    consoleInfo(
      `[${profile}] Download complete: ${downloaderCounter.complete}`
    );
    consoleInfo(`[${profile}] Download errors: ${downloaderCounter.errors}`);
    consoleInfo(`[${profile}] Download timeout: ${downloaderCounter.timeout}`);
    consoleInfo(
      `[${profile}] Download skipped by mayor version: ${downloaderCounter.skipByExistsMayorVersion}`
    );
    consoleInfo(
      `[${profile}] Download skipped by size: ${downloaderCounter.skipBySize}`
    );
    consoleInfo(
      `[${profile}] Download skipped by zero size: ${downloaderCounter.skipByZeroSize}`
    );

    resetVariables();
  }
};

const downloadPostsOfProfile = async (profile: string) => {
  consoleInfo("Starting...");

  const folderDir = getPathFolderProfile(profile);
  const folderTrashDir = getPathFolderProfileTrash(profile);

  consoleInfo(`[${profile}] Checking folders...`);

  fs.ensureDirSync(folderDir);
  fs.ensureDirSync(folderTrashDir);

  // await downloadByType(profile, folderDir, folderTrashDir, "advanceplus");
  // await wait(60 * 1000);
  await downloadByType(profile, folderDir, folderTrashDir, "advance");
  await wait(60 * 1000);
  await downloadByType(profile, folderDir, folderTrashDir, "normal");
};

export default downloadPostsOfProfile;
