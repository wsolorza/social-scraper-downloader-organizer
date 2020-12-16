import { cac } from "cac";
import dotenv from "dotenv";
import { Listr } from "listr2";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import loginTask from "@/utils/facebook/tasks/login";
import scraperProfilePhotosTasks from "@/utils/facebook/tasks/scrapers/profiles/photos";

dotenv.config();

const parsed = cac().parse();
const optionFastScroll = !!parsed.options.fastScroll;
const optionDev = !!parsed.options.dev;
const optionVideos = !!parsed.options.videos;
const optionPage = !!parsed.options.page;

// const puppetterArgs = () => {
//   let args = puppeteer
//     .defaultArgs()
//     .filter((arg) => String(arg).toLowerCase() !== "--disable-extensions");
//
//   if (optionDev) {
//     args = args.filter(
//       (arg) =>
//         String(arg).toLowerCase() !== "--headless" &&
//         String(arg).toLowerCase() !== "--hide-scrollbars" &&
//         String(arg).toLowerCase() !== "--mute-audio"
//     );
//   }
//
//   if (optionVideos) {
//     args = args.concat([
//       "--load-extension=C:\\Users\\JOSEMANUEL\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions\\cgjnhhjpfcdhbhlcmmjppicjmgfkppok\\0.20.7.1_0",
//     ]);
//   }
//
//   return args;
// };

// const startScraper = async () => {
//   const browser = await puppeteer.launch({
//     ignoreDefaultArgs: true,
//     args: puppetterArgs().concat(["--disable-notifications"]),
//   });
//
//   try {
//     const page = await browser.newPage();
//     await page.setViewport({ width: 1920, height: 1080 });
//     await page.setUserAgent(
//       "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:54.0) Gecko/20100101 Firefox/54.0"
//     );
//
//     await login(page);
//
//     for (const profileUrl of parsed.args) {
//       await downloadProfile(page, profileUrl);
//     }
//
//     if (!optionDev) {
//       await browser.close();
//     }
//   } catch (e) {
//     consoleError(e.stack);
//     await browser.close();
//   }
// };

// const startScraper = async () => {
//   if (optionPage) {
//     if (optionVideos) {
//       // Download videos of page
//     } else {
//       await startScraperPagePhotos();
//     }
//   } else if (optionVideos) {
//     // Download videos
//   } else {
//     await startScraperProfilePhotos(
//       puppeteer,
//       optionFastScroll,
//       optionDev,
//       parsed.args
//     );
//   }
// };

puppeteer.use(StealthPlugin());

(async () => {
  const browser = await puppeteer.launch({
    headless: !optionDev,
  });

  const tasks = new Listr([loginTask(browser)], {
    rendererOptions: { collapseErrors: false, collapseSkips: false },
  });
  tasks.add(scraperProfilePhotosTasks(browser, optionFastScroll, parsed.args));

  await tasks.run();

  if (!optionDev) {
    await browser.close();
  }
})();
