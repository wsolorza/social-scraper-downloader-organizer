import {TypeVideo} from "@/utils/tiktok/interfaces/posts";
import { getUnixTime } from "date-fns";
import * as fs from "fs-extra";
import { resolve } from "path";
import sanitize from "sanitize-filename";

export const getPathFolder = () => {
  if (process.env.TIKTOK_FOLDER) {
    return process.env.TIKTOK_FOLDER;
  }

  return resolve(__dirname, "..", "db", "tiktok");
};

export const getPathFolderProfile = (profileName: string) =>
  resolve(getPathFolder(), sanitize(profileName));

export const getPathFolderProfileTrash = (profileName: string) =>
  resolve(getPathFolderProfile(profileName), "trash");

export const videoName = (idVideo: string, type: TypeVideo) => {
  if (type === "advanceplus") {
    return `${idVideo}_advanceplus`;
  }

  if (type === "advance") {
    return `${idVideo}_advance`;
  }

  return `${idVideo}`;
};

export const getPathOfVideo = (
  profileFolder: string,
  idVideo: string,
  type: TypeVideo
) => resolve(profileFolder, `${videoName(idVideo, type)}.mp4`);

export const getPathOfTrashVideo = (
  profileTrashFolder: string,
  idVideo: string,
  type: TypeVideo,
  reasonSize: boolean = false
) =>
  resolve(
    profileTrashFolder,
    `${videoName(idVideo, type)}_${reasonSize ? "size_" : ""}${getUnixTime(
      new Date()
    )}.mp4`
  );

export const existsVideo = (
  profileFolder: string,
  idVideo: string,
  type: TypeVideo
) => fs.existsSync(getPathOfVideo(profileFolder, idVideo, type));
