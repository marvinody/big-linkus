const path = require("path");
const pkg = require("./package.json");
const alias = { svelte: path.resolve("node_modules", "svelte") };
const extensions = [".mjs", ".js", ".json", ".svelte", ".html"];
const mainFields = ["svelte", "module", "browser", "main"];

const inBotFile = "./src/bot/index.js";
const outBotFile = "./bot.js";

module.exports = {
  mode: "none",
  entry: inBotFile,
  output: {
    path: __dirname,
    filename: outBotFile,
    libraryTarget: "commonjs2",
  },
  target: "node",
  resolve: { alias, extensions, mainFields },
  externals: Object.keys(pkg.dependencies).concat("encoding"),
  module: {},
  plugins: [],
  performance: {
    hints: false, // it doesn't matter if server.js is large
  },
};
