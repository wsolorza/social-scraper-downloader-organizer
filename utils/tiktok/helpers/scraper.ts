import { getUserProfileInfo, Result, user } from "tiktok-scraper";
import { TypePost } from "@/utils/tiktok/interfaces/posts";

export const scrapePost = (
  nameProfile: string,
  type: TypePost,
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

export const getProfilePhoto = async (
  nameProfile: string,
  optionSession: string
) => {
  const {
    user: { avatarLarger },
  } = await getUserProfileInfo(nameProfile, {
    sessionList: [optionSession],
  });

  if (avatarLarger === "") {
    return null;
  }

  const splits = avatarLarger.split("/");

  return { url: avatarLarger, name: splits[splits.length - 1] };
};
