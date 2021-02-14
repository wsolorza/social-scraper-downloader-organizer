import { getUserProfileInfo, Result, user, UserMetadata } from "tiktok-scraper";
import { TypePost } from "@/utils/tiktok/interfaces";

export const scrapePosts = async (
  nameProfile: string,
  type: TypePost,
  optionSession: string
): Promise<Result | null> => {
  try {
    if (type === "advanceplus") {
      return await user(nameProfile, {
        number: 9999,
        hdVideo: true,
        noWaterMark: true,
        sessionList: [optionSession],
      });
    }

    if (type === "advance") {
      return await user(nameProfile, {
        number: 9999,
        hdVideo: true,
        sessionList: [optionSession],
      });
    }

    return await user(nameProfile, {
      number: 9999,
      sessionList: [optionSession],
    });
  } catch {
    return null;
  }
};

export const scrapeProfile = async (
  nameProfile: string,
  optionSession: string
): Promise<UserMetadata | null> => {
  try {
    return await getUserProfileInfo(nameProfile, {
      sessionList: [optionSession],
    });
  } catch {
    return null;
  }
};
