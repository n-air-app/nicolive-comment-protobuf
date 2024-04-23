// build from protobuf defs to js and ts files
// usage: node build.js

const fs = require("node:fs");
const path = require("node:path");
const process = require("node:process");
const { pbjs, pbts } = require("protobufjs-cli");
const { globSync } = require("glob");

// chdir to script directory
process.chdir(__dirname);

const distDir = "dist";
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

const protoDir = "./proto";
const glob = path.join(protoDir, "/**/*.proto");
const jsFile = path.join(distDir, "index.js");
const tsFile = path.join(distDir, "index.d.ts");

const protoFiles = globSync(glob.replaceAll(path.sep, "/"));
// console.debug(glob, protoFiles);
runPbJs(protoFiles, jsFile);

runPbTs(jsFile, tsFile);

function runPbJs(protoFiles, jsPath) {
  if (!Array.isArray(protoFiles)) protoFiles = [protoFiles];

  console.log(`Generating ${jsPath} from ${protoFiles}`);

  const args = [
    protoFiles,
    ["-t", "static-module"], // 'json', 'json-module', 'proto2', 'proto3', 'static', 'static-module'
    ["-w", "commonjs"], // 'default', 'commonjs', 'amd', 'es6', 'closure'
    ["-p", protoDir],
    ["-o", jsPath],
  ].flat();

  const exitCode = pbjs.main(args);
  if (exitCode) {
    console.debug(`* pbjs ${args.join(" ")}`);
    throw new Error(`pbjs ${protoFiles} failed`);
  }
  console.log(`Generated ${jsPath}`);
}

function runPbTs(jsFiles, tsPath) {
  if (!Array.isArray(jsFiles)) jsFiles = [jsFiles];

  const args = [["-o", tsPath], jsFiles].flat();
  const exitCode = pbts.main(args);
  if (exitCode) {
    console.debug(`* pbts ${args.join(" ")}`);
    throw new Error(`pbts ${jsFiles} failed`);
  }
  console.log(`Generated ${tsPath}`);
}
