import { TypeVideo } from "@/utils/tiktok/interfaces/posts";
import { getUserProfileInfo, Result, user } from "tiktok-scraper";

export const scrapePost = (
  nameProfile: string,
  type: TypeVideo,
  userAgent: string,
  cookieId: string
): Promise<Result> => {
  if (type === "advanceplus") {
    return user(nameProfile, {
      number: 0,
      hdVideo: true,
      noWaterMark: true,
      headers: {
        "User-Agent": userAgent,
        Referer: "https://www.tiktok.com/",
        Cookie: `tt_webid_v2=68${cookieId}`,
      },
    });
  }

  if (type === "advance") {
    return user(nameProfile, {
      number: 0,
      hdVideo: true,
      headers: {
        "User-Agent": userAgent,
        Referer: "https://www.tiktok.com/",
        Cookie: `tt_webid_v2=68${cookieId}`,
      },
    });
  }

  return user(nameProfile, {
    number: 0,
    headers: {
      "User-Agent": userAgent,
      Referer: "https://www.tiktok.com/",
      Cookie: `tt_webid_v2=68${cookieId}`,
    },
  });
};

export const getProfilePhoto = async (
  nameProfile: string,
  userAgent: string,
  cookieId: string
) => {
  const {
    user: { avatarLarger },
  } = await getUserProfileInfo(nameProfile, {
    headers: {
      "User-Agent": userAgent,
      Referer: "https://www.tiktok.com/",
      Cookie: `tt_webid_v2=68${cookieId}`,
    },
  });

  if (avatarLarger === "") {
    return null;
  }

  const splits = avatarLarger.split("/");

  return { url: avatarLarger, name: splits[splits.length - 1] };
};
