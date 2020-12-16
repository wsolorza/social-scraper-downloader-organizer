/* eslint-disable no-param-reassign */
import fs from "fs-extra";
import { ListrTask } from "listr2";
import { isNil } from "lodash";
import { Browser } from "puppeteer";
import { getPathFolder } from "@/utils/facebookMobile/utils/paths";
import log from "@/utils/facebookMobile/utils/logger";

const loginTask = (browser: Browser): ListrTask => ({
  title: "Login",
  task: async (_ctx, task) => {
    task.output = "Ensure path folder exists";

    fs.ensureDirSync(getPathFolder());

    const page = await browser.newPage();

    task.output = "Go to Facebook and logging";

    await page.goto("https://m.facebook.com/");
    await page.waitForTimeout(5000);

    const moreButton = await page.$("#accept-cookie-banner-label");
    if (!isNil(moreButton)) {
      await moreButton.click();
    }

    const emailInput = await page.waitForSelector("#m_login_email");
    const passInput = await page.waitForSelector("#m_login_password");
    const loginButton = await page.waitForSelector('button[name="login"]');

    await emailInput.type(process.env.FACEBOOK_USER!);
    await passInput.type(process.env.FACEBOOK_PASSWORD!);
    await loginButton.click();

    await page.waitForNavigation({ waitUntil: "networkidle2" });
    await page.close();
  },
});

export default loginTask;
