import { cac } from "cac";
import dotenv from "dotenv";
import { Box, render, Text } from "ink";
import React, { FC, useCallback, useEffect, useState } from "react";
import useUpdateEffect from "@/hooks/useUpdateEffect";
import Profile from "@/utils/tiktok/components/Profile";

dotenv.config();

const parsed = cac().parse();
const optionSession = parsed.options.session;

interface TiktokProps {
  profiles: string[];
  session: string;
}

const Tiktok: FC<TiktokProps> = ({ profiles, session }) => {
  const [profilesPending, setProfilesPending] = useState<string[]>([
    ...profiles,
  ]);
  const [profileInProgress, setProfileInProgress] = useState<string | null>(
    null
  );

  const onFinishDownloadPosts = () => {
    setProfileInProgress(null);
  };

  const processing = (profile: string) => profileInProgress === profile;

  useUpdateEffect(() => {
    if (profileInProgress === null) {
      if (profilesPending.length !== 0) {
        setProfileInProgress(profilesPending[0]);
        setProfilesPending((prevState) => prevState.splice(1));
      } else {
        process.exit();
      }
    }
  }, [profileInProgress]);

  useEffect(() => {
    setProfileInProgress(profilesPending[0]);
    setProfilesPending((prevState) => prevState.splice(1));
  }, []);

  return (
    <Box flexDirection="column">
      <Text bold color="white">
        Tiktok scraper
      </Text>
      {profiles.map((profile) => (
        <Profile
          key={profile}
          session={session}
          name={profile}
          onFinishDownloadPosts={onFinishDownloadPosts}
          processing={processing(profile)}
        />
      ))}
    </Box>
  );
};

render(<Tiktok profiles={parsed.args as string[]} session={optionSession} />);
