import { resolve } from 'path';
import * as webpack from 'webpack';
import nodeExternals from 'webpack-node-externals';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';

delete process.env.TS_NODE_PROJECT;

const config: webpack.Configuration = {
  mode: 'development',
  target: 'node',
  entry: {
    instagram: './src/instagram.ts',
  },
  output: {
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: resolve(__dirname, 'tsconfig.json'),
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
