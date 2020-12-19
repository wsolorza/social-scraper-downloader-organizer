import axios from "axios";
import * as fs from "fs-extra";
import { Headers } from "tiktok-scraper";
import { TypeVideo } from "@/utils/tiktok/interfaces/posts";
import {
  getPathOfTrashVideo,
  getPathOfVideo,
} from "@/utils/tiktok/utils/paths";

const downloadFile = async (
  headers: Headers,
  url: string,
  folderDir: string,
  folderTrashDir: string,
  postId: string,
  type: TypeVideo,
  sizeComparasion: number | null = null
): Promise<unknown | "zero-size" | "skip"> => {
  const destination = getPathOfVideo(folderDir, postId, type);

  const { data: dataResponse, headers: headersResponse } = await axios({
    url,
    method: "GET",
    responseType: "stream",
    timeout: 1000 * 60 * 3,
    headers,
  });

  if (headersResponse["content-length"] === "0") {
    return new Promise((resolve1) => resolve1("zero-size"));
  }

  if (sizeComparasion !== null) {
    if (headersResponse["content-length"] === sizeComparasion.toString()) {
      return new Promise((resolve2) => resolve2("skip"));
    }

    fs.moveSync(
      destination,
      getPathOfTrashVideo(folderTrashDir, postId, type, true)
    );
  }

  const writer = fs.createWriteStream(destination);
  dataResponse.pipe(writer);

  return new Promise((resolve3, reject) => {
    writer.on("finish", resolve3);
    writer.on("error", reject);
  });
};

export default downloadFile;
