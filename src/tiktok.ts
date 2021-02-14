import { cac } from "cac";
import dotenv from "dotenv";
import { Listr } from "listr2";
import scrapingProfile from "@/tasks/tiktok/scrapingProfile";
import { Context } from "@/utils/tiktok/interfaces";

dotenv.config();

const parsed = cac().parse();
const optionSession = parsed.options.session;

(async () => {
  const context: Context = {
    session: optionSession,
  };

  const tasks = new Listr([], {
    ctx: context,
  });

  tasks.add({
    title: "Scraping profiles",
    task: (ctx) => {
      const tasksProfile = new Listr([], {
        ctx,
        concurrent: false,
        exitOnError: false,
        rendererOptions: {
          showSubtasks: true,
        },
      });

      parsed.args.forEach((value) => {
        tasksProfile.add(scrapingProfile(value));
      });

      return tasksProfile;
    },
  });

  await tasks.run();
})();
