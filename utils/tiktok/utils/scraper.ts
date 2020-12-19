import { Result, user } from "tiktok-scraper";
import { TypeVideo } from "@/utils/tiktok/interfaces/posts";

export const scrapePost = (
  nameProfile: string,
  type: TypeVideo,
  optionSession: string
): Promise<Result> => {
  if (type === "advanceplus") {
    return user(nameProfile, {
      number: 9999,
      hdVideo: true,
      noWaterMark: true,
      sessionList: [optionSession],
    });
  }

  if (type === "advance") {
    return user(nameProfile, {
      number: 9999,
      hdVideo: true,
      sessionList: [optionSession],
    });
  }

  return user(nameProfile, {
    number: 9999,
    sessionList: [optionSession],
  });
};

// export const getProfilePhoto = async (
//   nameProfile: string,
//   userAgent: string,
//   cookieId: string
// ) => {
//   const {
//     user: { avatarLarger },
//   } = await getUserProfileInfo(nameProfile, {
//     headers: {
//       "User-Agent": userAgent,
//       Referer: "https://www.tiktok.com/",
//       Cookie: `tt_webid_v2=68${cookieId}`,
//     },
//   });
//
//   if (avatarLarger === "") {
//     return null;
//   }
//
//   const splits = avatarLarger.split("/");
//
//   return { url: avatarLarger, name: splits[splits.length - 1] };
// };
