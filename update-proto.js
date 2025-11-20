const fs = require("node:fs/promises");
const path = require("node:path");
const { execSync } = require("node:child_process");
const { glob } = require("glob");

const sourceDir = path.join(__dirname, "../ndgr-edge-proto/");
const targetDir = path.join(__dirname, "proto/");

function removeComments(content) {
  // sed -i '/__REMOVE_BEGIN__/,/__REMOVE_END__/d'
  content = content.replace(/__REMOVE_BEGIN__[\s\S]*?__REMOVE_END__/g, "");

  // すべての行コメントとブロックコメントを除去
  return content.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, "");
}

async function resetDirSync(dirPath) {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
  } catch (err) {
    console.error("Error removing directory:", err);
    process.exit(1);
  }
  await fs.mkdir(dirPath, { recursive: true });
}

async function getSourceTag() {
  try {
    const tag = execSync("git describe --tags --exact-match HEAD", {
      cwd: sourceDir,
      encoding: "utf8",
    }).trim();
    console.log(`Source repository tag: ${tag}`);
    return tag;
  } catch (err) {
    console.log("Source repository: No exact tag on HEAD");
    return null;
  }
}

async function processFiles() {
  try {
    await fs.access(sourceDir);
  } catch (err) {
    console.error("Error accessing source directory:", err);
    process.exit(1);
  }

  await resetDirSync(targetDir);

  try {
    const files = await glob("**/*.proto", { cwd: sourceDir });
    for (let file of files) {
      const sourceFilePath = path.join(sourceDir, file);
      const targetFilePath = path.join(targetDir, file);

      await fs.mkdir(path.dirname(targetFilePath), { recursive: true });

      try {
        const content = await fs.readFile(sourceFilePath, "utf8");
        const newContent = removeComments(content);
        await fs.writeFile(targetFilePath, newContent, "utf8");
        console.log("Processed:", targetFilePath);
      } catch (err) {
        console.error("Error processing file:", sourceFilePath, err);
        process.exit(1);
      }
    }

    console.log("");
    await getSourceTag();
  } catch (err) {
    console.error("Error finding or handling .proto files:", err);
    process.exit(1);
  }
}

processFiles();
