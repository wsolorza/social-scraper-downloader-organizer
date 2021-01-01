import { Headers } from "tiktok-scraper";

export type TypePost = "normal" | "advance" | "advanceplus";

export interface Post {
  headers: Headers;
  id: string;
  type: TypePost;
  url: string;
}
