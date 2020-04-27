const path = require("path");
const pkg = require("./package.json");
const exec = require("child_process").exec;
const { unlink } = require("fs");

const alias = { svelte: path.resolve("node_modules", "svelte") };
const extensions = [".mjs", ".js", ".json", ".svelte", ".html"];
const mainFields = ["svelte", "module", "browser", "main"];

const seedFile = "test_seed.js";

module.exports = {
  mode: "none",
  entry: "./src/seed.js",
  output: {
    path: __dirname,
    filename: seedFile,
    libraryTarget: "commonjs2",
  },
  target: "node",
  resolve: { alias, extensions, mainFields },
  externals: Object.keys(pkg.dependencies).concat("encoding"),
  module: {},
  plugins: [
    {
      apply: (compiler) => {
        compiler.hooks.afterEmit.tap("AfterEmitPlugin", (compilation) => {
          exec(`node ${seedFile}`, (err, stdout, stderr) => {
            if (stdout) process.stdout.write(stdout);
            if (stderr) process.stderr.write(stderr);
            unlink(seedFile, () => {});
          });
        });
      },
    },
  ],
  performance: {
    hints: false, // it doesn't matter if server.js is large
  },
};
