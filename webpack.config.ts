/* eslint-disable import/no-extraneous-dependencies */
import { resolve } from "path";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import { TsconfigPathsPlugin } from "tsconfig-paths-webpack-plugin";
import * as webpack from "webpack";
import nodeExternals from "webpack-node-externals";

delete process.env.TS_NODE_PROJECT;

const config: webpack.Configuration = {
  mode: "development",
  target: "node",
  entry: {
    facebook: "./src/facebook.ts",
    facebookMobile: "./src/facebookMobile.ts",
    instagram: "./src/instagram.ts",
    Tiktok: "./src/Tiktok.tsx",
  },
  output: {
    filename: "[name].bundle.js",
    path: resolve(process.cwd(), "dist"),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: resolve(__dirname, "tsconfig.json"),
      }),
    ],
  },
  node: {
    __dirname: false,
  },
  externals: [nodeExternals()],
  plugins: [new CleanWebpackPlugin()],
};

export default config;
