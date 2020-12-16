import { cac } from "cac";
import dotenv from "dotenv";
import { Listr } from "listr2";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import loginTask from "@/utils/facebookMobile/tasks/login";
import scraperProfilePhotosTasks from "@/utils/facebookMobile/tasks/scrapers/profile/photos";

dotenv.config();

const parsed = cac().parse();
const optionDev = !!parsed.options.dev;
const optionVideos = !!parsed.options.videos;
const optionPage = !!parsed.options.page;

puppeteer.use(StealthPlugin());

(async () => {
  const browser = await puppeteer.launch({
    headless: !optionDev,
    defaultViewport: {
      width: 7680,
      height: 4320,
    },
  });

  const tasks = new Listr([loginTask(browser)], {
    rendererOptions: {
      collapse: false,
      collapseErrors: false,
      collapseSkips: false,
      showSubtasks: true,
    },
  });

  if (optionPage) {
    if (optionVideos) {
      //
    } else {
      //
    }
  } else if (optionVideos) {
    //
  } else {
    tasks.add(scraperProfilePhotosTasks(browser, parsed.args));
  }

  await tasks.run();

  if (!optionDev) {
    await browser.close();
  }
})();
