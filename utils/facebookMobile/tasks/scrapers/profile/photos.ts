/* eslint-disable no-param-reassign */
import { resolve } from "path";
import { parse } from "url";
import fs from "fs-extra";
import { Listr, ListrTask } from "listr2";
import { isNil } from "lodash";
import { Browser, Page } from "puppeteer";
import { Album, PhotoViewer } from "@/utils/facebookMobile/interfaces/photos";
import downloadFile from "@/utils/facebookMobile/utils/downloadFile";
import log from "@/utils/facebookMobile/utils/logger";
import {
  getPathFolderPhotoAlbum,
  getPathFolderPhotoAlbums,
  getPathFolderProfile,
  getPathPhoto,
} from "@/utils/facebookMobile/utils/paths";

const getPhoto = async (
  page: Page,
  profileName: string,
  photoViewer: PhotoViewer
) => {
  log(profileName, `Go to: https://m.facebook.com${photoViewer.url}`);
  await page.goto(`https://m.facebook.com${photoViewer.url}`);
  await page.waitForSelector('div[role="main"]');

  const photoNode = await page.$(
    '.attachment a[href^="/photo/view_full_size/"]'
  );

  if (!isNil(photoNode)) {
    const photoHref = await photoNode.evaluate((el) => el.getAttribute("href"));

    if (isNil(photoHref)) {
      return null;
    }

    log(profileName, `Go to: https://m.facebook.com${photoHref}`);
    await page.goto(`https://m.facebook.com${photoHref}`, {
      waitUntil: "load",
    });

    return page.url();
  }

  const photoAltNode = await page.$('i[data-sigil="photo-image"]');

  if (isNil(photoAltNode)) {
    return null;
  }

  const photoAltHref = await page.evaluate((obj) => {
    return obj.getAttribute("data-store");
  }, photoAltNode);

  if (isNil(photoAltHref)) {
    log(profileName, `Alt url not found`);
    return null;
  }

  const altUrl = JSON.parse(photoAltHref).imgsrc;
  log(profileName, `Alt url found: ${altUrl}`);

  return altUrl;
};

const getPhotosViewer = async (
  page: Page,
  album: Album,
  profileName: string
) => {
  try {
    const PATH_JSON_PHOTOS_VIEWER = resolve(
      getPathFolderPhotoAlbum(profileName, album),
      "photos-viewer.json"
    );

    const PHOTO_VIEWERS: PhotoViewer[] = [];

    log(profileName, `Go to: https://m.facebook.com${album.url}`);
    await page.goto(`https://m.facebook.com${album.url}`);
    await page.waitForSelector('div[role="main"]');
    await page.waitForTimeout(10 * 1000);

    // Bucle en Ver Más
    let moreDiv = await page.$("#m_more_photos");
    while (moreDiv !== null) {
      log(profileName, `Scroll to Bottom`);
      await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
      await page.waitForTimeout(10 * 1000);

      moreDiv = await page.$("#m_more_photos");
    }

    const urlPhotosViewerNode = await page.$$(
      'div[role="main"] a[href^="/photo.php?"]'
    );

    for (const urlPhotoViewerNode of urlPhotosViewerNode) {
      const urlPhotoViewer = await urlPhotoViewerNode.evaluate((el) =>
        el.getAttribute("href")
      );

      if (!isNil(urlPhotoViewer)) {
        PHOTO_VIEWERS.push({ url: urlPhotoViewer });
      }
    }

    fs.writeFileSync(PATH_JSON_PHOTOS_VIEWER, JSON.stringify(PHOTO_VIEWERS));

    return PHOTO_VIEWERS;
  } catch (e) {
    return [];
  }
};

const getAlbumsList = async (
  page: Page,
  profileUrl: string,
  profileName: string
) => {
  const PATH_JSON_ALBUMS_LIST = resolve(
    getPathFolderProfile(profileName),
    "albums",
    "albums.json"
  );

  log(profileName, `Go to: ${profileUrl}/photos`);
  await page.goto(`${profileUrl}/photos`);
  await page.waitForSelector(".timeline.albums");

  // Bucle en Boton de Ver Más
  let moreButton = await page.$("#m_more_albums a");
  while (moreButton !== null) {
    await moreButton.focus();
    log(profileName, `Click in more button`);
    await moreButton.click();

    await page.waitForTimeout(30 * 1000);

    moreButton = await page.$("#m_more_albums a");
  }

  // Verifico el selector del album
  await page.waitForSelector(".timeline.albums a");

  const albums: Album[] = [];
  const albumsNode = await page.$$(".timeline.albums a");

  for (const albumNode of albumsNode) {
    const albumUrl = await albumNode.evaluate((el) => el.getAttribute("href"));
    if (albumUrl === null) {
      continue;
    }

    const albumTitleNode = await albumNode.$(".title strong");
    if (albumTitleNode === null) {
      continue;
    }

    const albumTitle = await albumTitleNode.evaluate((el) => el.innerHTML);
    if (albumTitle === null) {
      continue;
    }

    let albumId = "?";
    if (albumUrl.includes("album=")) {
      albumId = parse(albumUrl, true).query.album as string;
    } else if (albumUrl.includes("/albums/")) {
      albumId = albumUrl
        .substring(albumUrl.length - 1, 1)
        .split("/")
        .pop() as string;
    }

    const newAlbum: Album = { name: albumTitle, url: albumUrl, id: albumId };
    albums.push(newAlbum);
  }

  fs.writeFileSync(PATH_JSON_ALBUMS_LIST, JSON.stringify(albums));

  return albums;
};

const scraperProfilePhotosTask = (
  browser: Browser,
  profileUrl: string
): ListrTask => ({
  title: profileUrl,
  task: async (ctx, task) => {
    const page = await browser.newPage();

    await page.goto(profileUrl);
    await page.waitForSelector("h3");

    task.output = "Getting name of profile";

    let profileName = profileUrl.replace("https://m.facebook.com/", "");
    if (profileUrl.indexOf("profile.php?id=") !== -1) {
      profileName = parse(profileUrl, true).query.id as string;
    }

    log(profileName, `Name found: ${profileName}`);
    fs.ensureDirSync(getPathFolderPhotoAlbums(profileName));

    task.output = "Getting albums of photos";

    let albumsList = await getAlbumsList(page, profileUrl, profileName);
    albumsList = albumsList.sort(() => Math.random() - 0.5);

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
        ) as PhotoViewer[];
      }

      task.output = `Getting photos viewers of album ${album.name}`;

      const photosViewer = await getPhotosViewer(page, album, profileName);

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

        const photo = await getPhoto(page, profileName, photoViewer);
        if (isNil(photo)) {
          continue;
        }

        const photoName = parse(photo, true)
          .pathname!.split("/")
          .pop() as string;
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
  profiles: readonly string[]
): ListrTask => ({
  title: "Download photos of profile",
  task: () => {
    const listr = new Listr([], {
      concurrent: 2,
      rendererOptions: {
        collapse: false,
        collapseErrors: false,
        collapseSkips: false,
        showSubtasks: true,
      },
      exitOnError: false,
    });

    for (const profileUrl of profiles) {
      const profileUrlConvert = profileUrl.replace(
        "https://www.facebook.com/",
        "https://m.facebook.com/"
      );

      listr.add(scraperProfilePhotosTask(browser, profileUrlConvert));
    }

    return listr;
  },
});

export default scraperProfilePhotosTasks;
