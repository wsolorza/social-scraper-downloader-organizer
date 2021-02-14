import axios from "axios";
import * as fs from "fs-extra";
import { getPathFileImage } from "@/utils/tiktok/paths";

const downloadImage = async (
  url: string,
  profile: string,
  fileName: string
) => {
  const destination = getPathFileImage(profile, fileName);

  const { data: dataResponse } = await axios({
    url,
    method: "GET",
    responseType: "stream",
    timeout: 1000 * 60 * 3,
  });

  const writer = fs.createWriteStream(destination);
  dataResponse.pipe(writer);

  return new Promise((resolve3, reject) => {
    writer.on("finish", resolve3);
    writer.on("error", reject);
  });
};

export default downloadImage;
