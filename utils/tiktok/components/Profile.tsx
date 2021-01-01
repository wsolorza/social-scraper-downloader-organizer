import * as fs from "fs-extra";
import { Box, Text } from "ink";
import Spinner from "ink-spinner";
import React, { FC, useEffect, useState } from "react";
import useUpdateEffect from "@/hooks/useUpdateEffect";
import {
  existsFileVideo,
  getPathFileVideo,
  getPathFileVideoTrash,
} from "@/utils/tiktok/helpers/paths";
import downloadFile from "@/utils/tiktok/helpers/downloadFile";
import { scrapePost } from "@/utils/tiktok/helpers/scraper";
import { Post, TypePost } from "@/utils/tiktok/interfaces/posts";

interface ProfileProps {
  name: string;
  onFinishDownloadPosts: () => void;
  processing: boolean;
  session: string;
}

const Profile: FC<ProfileProps> = ({
  name,
  onFinishDownloadPosts,
  processing,
  session,
}) => {
  const [finishDownloadPosts, setFinishDownloadPosts] = useState(false);
  const [scrapingVideos, setScrapingVideos] = useState(true);

  const [postsPending, setPostsPending] = useState<Post[]>([]);
  const [postInProgress, setPostInProgress] = useState<Post | null>(null);
  const [postsSkipped, setPostsSkipped] = useState<Post[]>([]);
  const [postsCompleted, setPostsCompleted] = useState<Post[]>([]);
  const [postsErrors, setPostsErrors] = useState<Post[]>([]);

  const downloadPost = async (post: Post) => {
    const destination = getPathFileVideo(name, post.id, post.type);

    let sizeDownloaded: null | number = null;
    if (fs.existsSync(destination)) {
      sizeDownloaded = fs.statSync(destination).size;
    }

    try {
      const data = await downloadFile(
        post.headers,
        post.url,
        name,
        post.id,
        post.type,
        sizeDownloaded
      );

      if (data === "skip") {
        setPostsSkipped((prevState) => [...prevState, post]);
      } else if (data === "zero-size") {
        setPostsErrors((prevState) => [...prevState, post]);
      } else if (
        post.type === "advanceplus" &&
        existsFileVideo(name, post.id, "advance")
      ) {
        fs.moveSync(
          getPathFileVideo(name, post.id, "advance"),
          getPathFileVideoTrash(name, post.id, "advance")
        );

        setPostsCompleted((prevState) => [...prevState, post]);
      } else if (
        post.type === "advanceplus" &&
        existsFileVideo(name, post.id, "normal")
      ) {
        fs.moveSync(
          getPathFileVideo(name, post.id, "normal"),
          getPathFileVideoTrash(name, post.id, "normal")
        );

        setPostsCompleted((prevState) => [...prevState, post]);
      } else if (
        post.type === "advance" &&
        existsFileVideo(name, post.id, "normal")
      ) {
        fs.moveSync(
          getPathFileVideo(name, post.id, "normal"),
          getPathFileVideoTrash(name, post.id, "normal")
        );

        setPostsCompleted((prevState) => [...prevState, post]);
      } else {
        setPostsCompleted((prevState) => [...prevState, post]);
      }
    } catch {
      setPostsErrors((prevState) => [...prevState, post]);
    } finally {
      setPostInProgress(null);
    }
  };

  const scrapingPost = async (type: TypePost) => {
    const posts = await scrapePost(name, type, session);
    posts.collector.forEach((post) => {
      if (type === "advanceplus") {
        if (post.videoUrlNoWaterMark !== null) {
          setPostsPending((prevState) => {
            if (
              prevState.findIndex(
                (value) => value.id === post.id && value.type === type
              ) !== -1
            ) {
              return prevState;
            }

            return [
              ...prevState,
              {
                id: post.id,
                type,
                url: post.videoUrlNoWaterMark!,
                headers: posts.headers,
              },
            ];
          });
        }
      } else if (type === "advance") {
        if (!existsFileVideo(name, post.id, "advanceplus")) {
          setPostsPending((prevState) => {
            if (
              prevState.findIndex(
                (value) => value.id === post.id && value.type === type
              ) !== -1
            ) {
              return prevState;
            }

            return [
              ...prevState,
              {
                id: post.id,
                type,
                url: post.videoUrl,
                headers: posts.headers,
              },
            ];
          });
        }
      } else if (type === "normal") {
        if (
          !existsFileVideo(name, post.id, "advanceplus") &&
          !existsFileVideo(name, post.id, "advance")
        ) {
          setPostsPending((prevState) => {
            if (prevState.findIndex((value) => value.id === post.id) !== -1) {
              return prevState;
            }

            return [
              ...prevState,
              {
                id: post.id,
                type,
                url: post.videoUrl,
                headers: posts.headers,
              },
            ];
          });
        }
      }
    });

    setScrapingVideos(false);
  };

  useUpdateEffect(() => {
    if (finishDownloadPosts) {
      onFinishDownloadPosts();
    }
  }, [finishDownloadPosts]);

  useUpdateEffect(() => {
    if (!scrapingVideos && postsPending.length === 0) {
      setFinishDownloadPosts(true);
    }
  }, [postsCompleted, postsErrors, postsSkipped]);

  useUpdateEffect(() => {
    if (postInProgress !== null) {
      downloadPost(postInProgress);
    } else if (postsPending.length !== 0) {
      setPostInProgress(postsPending[0]);
      setPostsPending((prevState) => prevState.splice(1));
    }
  }, [postInProgress]);

  useUpdateEffect(() => {
    if (!scrapingVideos) {
      if (postsPending.length !== 0) {
        setPostInProgress(postsPending[0]);
        setPostsPending((prevState) => prevState.splice(1));
      } else {
        setFinishDownloadPosts(true);
      }
    }
  }, [scrapingVideos]);

  useEffect(() => {
    if (processing) {
      scrapingPost("advance");
    }
  }, [processing]);

  return (
    <Box paddingLeft={1} flexDirection="column">
      <Text color="white">{name}</Text>
      <Box paddingLeft={1} flexDirection="column">
        <Text color="white">
          {scrapingVideos ? <Spinner /> : "✔"} Scraping videos
        </Text>
        <Box paddingLeft={3} flexDirection="column">
          {!scrapingVideos ? (
            <>
              <Text color="white">{postsPending.length} posts pending</Text>
              {postInProgress ? (
                <Text color="#005cc5">
                  Post with id {postInProgress.id} processing
                </Text>
              ) : null}
              <Text color="green">{postsCompleted.length} posts complete</Text>
              <Text color="yellow">{postsSkipped.length} posts skipped</Text>
              <Text color="red">{postsErrors.length} posts with errors</Text>
            </>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};

export default Profile;
