const webpack = require("webpack");
const path = require("path");
const config = {
  target: "node",
  module: {
    rules: [{ test: /\.tsx?$/, use: "ts-loader", exclude: /node_modules/ }],
  },
  entry: {
    do_work_autotask: "./src/do_work_autotask.ts",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
    libraryTarget: "commonjs2",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  externals: [
    // List here all dependencies available on the Autotask environment
    /axios/,
    /apollo-client/,
    /defender-[^\-]+-client/,
    /ethers/,
    /web3/,
    /@ethersproject\/.*/,
    /aws-sdk/,
    /aws-sdk\/.*/,
    "fsevents",
  ],
  externalsType: "commonjs2",
};

module.exports = config;
