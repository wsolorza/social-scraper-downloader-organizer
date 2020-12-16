/* eslint-disable no-param-reassign */
import { ListrTaskWrapper } from "listr2";
import { Page } from "puppeteer";

const scrollToEnd = async (
  page: Page,
  taskInstance: ListrTaskWrapper<any, any>,
  fastScroll: boolean
) => {
  const limit = fastScroll ? 50 : 300;

  for (let x = 0; x <= limit; x += 1) {
    await page.evaluate("window.scrollTo(0,0)");
    await page.waitForTimeout(fastScroll ? 1500 : 3000);
    await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
    await page.waitForTimeout(fastScroll ? 1500 : 3000);
    taskInstance.output = `Scroll: ${x}/${limit}`;
  }
};

export default scrollToEnd;
