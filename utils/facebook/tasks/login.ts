/* eslint-disable no-param-reassign */
import { resolve } from "path";
import fs from "fs-extra";
import { ListrTask } from "listr2";
import { Browser } from "puppeteer";
import { getPathFolder } from "@/utils/facebook/utils/paths";

const loginTask = (browser: Browser): ListrTask => ({
  title: "Login",
  task: async (ctx, task) => {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    const jsonCookiePath = resolve(getPathFolder(), "cookies.json");
    if (fs.existsSync(jsonCookiePath)) {
      task.output = "Reading and setting old cookies";

      const cookiesJson = JSON.parse(
          fs.readFileSync(resolve(getPathFolder(), "cookies.json")).toString()
      );
      await page.setCookie(...cookiesJson);
    }

    task.output = "Go to Facebook and logging";

    await page.goto("https://www.facebook.com");
    const emailInput = await page.waitForSelector("#email");
    const passInput = await page.waitForSelector("#pass");
    const loginButton = await page.waitForSelector('button[name="login"]');

    await emailInput.type(process.env.FACEBOOK_USER!);
    await passInput.type(process.env.FACEBOOK_PASSWORD!);
    await loginButton.click();

    task.output = "Saving new cookies";

    const currentCookies = await page.cookies();

    fs.writeFileSync(
        resolve(getPathFolder(), "cookies.json"),
        JSON.stringify(currentCookies)
    );

    await page.waitForNavigation({ waitUntil: "networkidle2" });
    await page.close();
  },
});

export default loginTask;
