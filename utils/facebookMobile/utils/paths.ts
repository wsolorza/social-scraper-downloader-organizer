import {resolve} from "path";
import sanitize from "sanitize-filename";
import {Album} from "@/utils/facebook/interfaces/photos";

export const getPathFolder = (): string => {
    if (process.env.FACEBOOK_MOBILE_FOLDER) {
        return process.env.FACEBOOK_MOBILE_FOLDER;
    }

    return resolve(__dirname, "..", "db", "facebookMobile");
};

export const getPathFolderProfile = (profileName: string) =>
    resolve(getPathFolder(), sanitize(profileName));

export const getPathFolderPhotoAlbums = (profileName: string) =>
    resolve(getPathFolderProfile(profileName), "albums");

export const getPathFolderPhotoAlbum = (profileName: string, album: Album) =>
  resolve(
    getPathFolderProfile(profileName),
    "albums",
    `[${album.id}] ${sanitize(album.name)}`
  );

export const getPathPhoto = (
  profileName: string,
  album: Album,
  photoName: string
) => resolve(getPathFolderPhotoAlbum(profileName, album), sanitize(photoName));

export const getPathFolderVideo = (profileName: string) =>
    resolve(getPathFolderProfile(profileName), "videos");