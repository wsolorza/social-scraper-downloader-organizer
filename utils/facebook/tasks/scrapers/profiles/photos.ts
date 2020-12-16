/* eslint-disable no-param-reassign */
import { resolve } from "path";
import { parse } from "url";
import fs from "fs-extra";
import { Listr, ListrTask, ListrTaskWrapper } from "listr2";
import { isNil } from "lodash";
import { Browser, Page } from "puppeteer";
import { Album, PhotoViewer } from "@/utils/facebook/interfaces/photos";
import downloadFile from "@/utils/facebook/utils/downloadFile";
import {
  getPathFolderPhotoAlbum,
  getPathFolderPhotoAlbums,
  getPathFolderProfile,
  getPathPhoto,
} from "@/utils/facebook/utils/paths";
import scrollToEnd from "@/utils/facebook/utils/scrollToEnd";

const getPhoto = async (
  page: Page,
  profileName: string,
  album: Album,
  photoViewer: PhotoViewer
) => {
  await page.goto(photoViewer.url);
  await page.waitForSelector('div[data-pagelet="MediaViewerPhoto"]');

  const photoNode = await page.$('div[data-pagelet="MediaViewerPhoto"] img');

  return photoNode?.evaluate((el) => el.getAttribute("src"));
};

const getPhotosViewer = async (
  page: Page,
  taskInstance: ListrTaskWrapper<any, any>,
  fastScroll: boolean,
  profileName: string,
  album: Album
) => {
  try {
    const PATH_JSON_PHOTOS_VIEWER = resolve(
      getPathFolderPhotoAlbum(profileName, album),
      "photos-viewer.json"
    );

    const PHOTOS_VIEWER: PhotoViewer[] = [];

    await page.goto(album.url);
    await page.waitForSelector('div[role="main"] > div:nth-child(4)');

    await scrollToEnd(page, taskInstance, fastScroll);

    let urlPhotosViewerNode;
    if (album.name === "Shared album") {
      urlPhotosViewerNode = await page.$$(
        'div[role="main"] > div:nth-child(4) a[href^="https://www.facebook.com/photo"]'
      );
    } else {
      urlPhotosViewerNode = await page.$$(
        'div[role="main"] > div:nth-child(4) a[href^="/photo/"]'
      );
    }

    for (const urlPhotoViewerNode of urlPhotosViewerNode) {
      const urlPhotoViewer = await urlPhotoViewerNode.evaluate((el) =>
        el.getAttribute("href")
      );

      if (!isNil(urlPhotoViewer)) {
        if (album.name === "Shared album") {
          PHOTOS_VIEWER.push({ url: urlPhotoViewer });
        } else {
          PHOTOS_VIEWER.push({
            url: `https://www.facebook.com${urlPhotoViewer}`,
          });
        }
      }
    }

    fs.writeFileSync(PATH_JSON_PHOTOS_VIEWER, JSON.stringify(PHOTOS_VIEWER));

    return PHOTOS_VIEWER;
  } catch (e) {
    return [];
  }
};

const getAlbumsList = async (
  page: Page,
  taskInstance: ListrTaskWrapper<any, any>,
  fastScroll: boolean,
  profileUrl: string,
  profileName: string
) => {
  const PATH_JSON_ALBUMS_LIST = resolve(
    getPathFolderProfile(profileName),
    "albums",
    "albums.json"
  );

  let albumsPhotosUrl = `${profileUrl}/photos_albums`;
  if (profileUrl.indexOf("profile.php?id=") !== -1) {
    albumsPhotosUrl = `${profileUrl}&sk=photos_albums`;
  }

  await page.goto(albumsPhotosUrl);
  await page.waitForSelector('div[role="main"]');

  await scrollToEnd(page, taskInstance, fastScroll);

  await page.waitForSelector('a[href^="https://www.facebook.com/media/set"]');

  const albums: Album[] = [];
  const albumsNode = await page.$$(
    'a[href^="https://www.facebook.com/media/set"]'
  );

  for (const albumNode of albumsNode) {
    const albumUrl = await albumNode.evaluate((el) => el.getAttribute("href"));
    if (isNil(albumUrl)) {
      continue;
    }

    const albumTitleNode = await albumNode.$("span");
    if (isNil(albumTitleNode)) {
      continue;
    }

    const albumTitle = await albumTitleNode.evaluate((el) => el.innerHTML);
    if (isNil(albumTitle)) {
      continue;
    }

    const albumId = parse(albumUrl, true).query.set as string;
    const newAlbum: Album = { name: albumTitle, url: albumUrl, id: albumId };
    albums.push(newAlbum);
  }

  fs.writeFileSync(PATH_JSON_ALBUMS_LIST, JSON.stringify(albums));

  return albums;
};

const checkHasPhotosOf = async (page: Page, profileUrl: string) => {
  try {
    const albumPhotosOfUrl = `${profileUrl}/photos_of`;
    await page.goto(albumPhotosOfUrl);
    await page.waitForSelector('div[role="main"] > div:nth-child(4)');

    const spansNode = await page.$$('div[role="main"] > div:nth-child(4) span');
    for (const spanNode of spansNode) {
      const span: string = await spanNode.evaluate((el) => el.innerHTML);
      if (span === "No photos to show") {
        return false;
      }
    }

    return true;
  } catch (e) {
    return false;
  }
};

const scraperProfilePhotosTask = (
  browser: Browser,
  fastScroll: boolean,
  profileUrl: string
): ListrTask => ({
  title: profileUrl,
  task: async (ctx, task) => {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    await page.goto(profileUrl);
    await page.waitForSelector("h1");

    task.output = "Getting name of profile";

    let profileName = profileUrl.replace("https://www.facebook.com/", "");
    if (profileUrl.indexOf("profile.php?id=") !== -1) {
      profileName = parse(profileUrl, true).query.id as string;
    }

    fs.ensureDirSync(getPathFolderPhotoAlbums(profileName));

    const hasPhotosOf =
      (await checkHasPhotosOf(page, profileUrl)) &&
      profileUrl.indexOf("profile.php?id=") === -1;

    task.output = "Getting albums of photos";

    let albumsList = await getAlbumsList(
      page,
      task,
      fastScroll,
      profileUrl,
      profileName
    );
    albumsList = albumsList.sort(() => Math.random() - 0.5);

    if (hasPhotosOf) {
      albumsList.push({
        name: "Shared album",
        url: `${profileUrl}/photos_of`,
        id: "-",
      });
    }

    await page.waitForTimeout(60 * 1000);

    let albumLoaded = 1;
    for (const album of albumsList) {
      task.output = `Loading albums: ${albumLoaded}/${albumsList.length} - ${album.name}`;

      const PATH_JSON_PHOTOS_VIEWER_DOWNLOADED = resolve(
        getPathFolderPhotoAlbum(profileName, album),
        "photos-viewer-downloaded.json"
      );

      fs.ensureDirSync(getPathFolderPhotoAlbum(profileName, album));

      let photosViewerDownloaded: PhotoViewer[] = [];

      if (fs.existsSync(PATH_JSON_PHOTOS_VIEWER_DOWNLOADED)) {
        photosViewerDownloaded = JSON.parse(
          fs.readFileSync(PATH_JSON_PHOTOS_VIEWER_DOWNLOADED).toString()
        );
      }

      task.output = `Getting photos viewers of album ${album.name}`;

      const photosViewer = await getPhotosViewer(
        page,
        task,
        fastScroll,
        profileName,
        album
      );

      task.output = `${photosViewer.length} photos found`;

      await page.waitForTimeout(30 * 1000);

      let photoViewerLoaded = 1;
      for (const photoViewer of photosViewer) {
        task.output = `Loading photo viewer: ${photoViewerLoaded}/${photosViewer.length}`;

        const PHOTOS_VIEWER_ALREADY_DOWNLOADED =
          photosViewerDownloaded.find((photoViewerDownloaded) => {
            return photoViewerDownloaded.url === photoViewer.url;
          }) !== undefined;

        if (PHOTOS_VIEWER_ALREADY_DOWNLOADED) {
          photoViewerLoaded += 1;
          continue;
        }

        const photo = await getPhoto(page, profileName, album, photoViewer);

        if (isNil(photo)) {
          continue;
        }

        const photoPathNames = parse(photo, true).pathname!.split("/");
        const photoName = photoPathNames[photoPathNames.length - 1];

        await downloadFile(photo, getPathPhoto(profileName, album, photoName));

        photosViewerDownloaded.push(photoViewer);

        fs.writeFileSync(
          PATH_JSON_PHOTOS_VIEWER_DOWNLOADED,
          JSON.stringify(photosViewerDownloaded)
        );

        await page.waitForTimeout(5 * 1000);
        photoViewerLoaded += 1;
      }

      albumLoaded += 1;
      await page.waitForTimeout(2 * 60 * 1000);
    }

    await page.close();
  },
});

const scraperProfilePhotosTasks = (
  browser: Browser,
  fastScroll: boolean,
  profiles: readonly string[]
): ListrTask => ({
  title: "Download photos of profile",
  task: () => {
    const listr = new Listr([], {
      concurrent: 3,
      rendererOptions: { collapse: false },
      exitOnError: false,
    });

    for (const profileUrl of profiles) {
      listr.add(scraperProfilePhotosTask(browser, fastScroll, profileUrl));
    }

    return listr;
  },
});

export default scraperProfilePhotosTasks;
