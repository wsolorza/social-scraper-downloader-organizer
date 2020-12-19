import { cac } from "cac";
import dotenv from "dotenv";
import { Listr } from "listr2";
import scraperProfiles from "@/utils/tiktok/tasks/scrapers/profile";

dotenv.config();

const parsed = cac().parse();
const optionSession = parsed.options.session;

(async () => {
  const tasks = new Listr([scraperProfiles(parsed.args,optionSession)], {
    rendererOptions: {
      collapse: false,
      collapseErrors: false,
      collapseSkips: false,
      showSubtasks: true,
    },
  });

  await tasks.run();
})();
