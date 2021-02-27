import axios from "axios";
import chalk from "chalk";
import * as fs from "fs-extra";
import { Headers } from "tiktok-scraper";
import { TypePost } from "@/utils/tiktok/interfaces";
import {
  existsFileVideo,
  getPathFileImage,
  getPathFileVideo,
  getPathFileVideoTrash,
} from "@/utils/tiktok/paths";

export const downloadImage = async (
  profile: string,
  url: string,
  fileName: string
) => {
  console.log(chalk.gray(`[${profile}] Downloading image of profile`));

  const destination = getPathFileImage(profile, fileName);

  const { data: dataResponse } = await axios({
    url,
    method: "GET",
    responseType: "stream",
    timeout: 1000 * 60 * 3,
  });

  const writer = fs.createWriteStream(destination);
  dataResponse.pipe(writer);

  return new Promise((resolve3, reject) => {
    writer.on("finish", resolve3);
    writer.on("error", reject);
  });
};

export const downloadVideo = async (
  profile: string,
  url: string,
  headers: Headers,
  postId: string,
  type: TypePost
): Promise<"successfull" | "zero-size" | "same-size"> => {
  const destination = getPathFileVideo(profile, postId, type);

  let sizeDownloaded: null | number = null;
  if (fs.existsSync(destination)) {
    sizeDownloaded = fs.statSync(destination).size;
  }

  const { data: dataResponse, headers: headersResponse } = await axios({
    url,
    method: "GET",
    responseType: "stream",
    timeout: 1000 * 60 * 3,
    headers,
  });

  if (headersResponse["content-length"] === "0") {
    return new Promise((resolve) => resolve("zero-size"));
  }

  if (sizeDownloaded !== null) {
    if (headersResponse["content-length"] === sizeDownloaded.toString()) {
      return new Promise((resolve) => resolve("same-size"));
    }

    fs.moveSync(
      destination,
      getPathFileVideoTrash(profile, postId, type, true)
    );
  }

  const writer = fs.createWriteStream(destination);
  dataResponse.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", () => {
      if (
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

      return resolve("successfull");
    });

    writer.on("error", reject);
  });
};
