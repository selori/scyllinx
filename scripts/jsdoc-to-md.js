import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";
import jsdoc2md from "jsdoc-to-markdown";
import { execSync } from "child_process";
import { rm } from 'fs/promises';

async function clean(directory) {
  try {
    await rm(directory, { recursive: true, force: true });
    console.log(directory, ' klasörü silindi.');
  } catch (err) {
    console.error('Silme hatası:', err);
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.resolve(__dirname, "../api-dist");
const docsPath = path.resolve(__dirname, "../docs/api");
const templatePath = path.resolve(__dirname, "template.hbs");

fs.mkdirSync(docsPath, { recursive: true });

function getJSFiles(dir) {
  const files = [];
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      files.push(...getJSFiles(fullPath));
    } else if (file.endsWith(".js")) {
      files.push(fullPath);
    }
  }
  return files;
}

const jsFiles = getJSFiles(distPath);
const template = fs.readFileSync(templatePath, "utf-8");

for (const file of jsFiles) {
  const name = path.basename(file, ".js").toLowerCase();
  const outPath = path.join(docsPath, `${name}.md`);
  console.log("Generating:", outPath);

  const output = await jsdoc2md.render({
    files: file,
    template,
    memberIndexFormat: "grouped",
  });

  fs.writeFileSync(outPath, output);
}

// jsFiles.forEach((file) => {
//   const name = path.basename(file, ".js").toLowerCase();
//   const outPath = path.join(docsPath, name + ".md");
//   const cmd = `npx jsdoc-to-markdown "${file}" --template scripts/template.hbs  --member-index-format grouped > "${outPath}"`;

//   console.log("Generating:", outPath);
//   execSync(cmd, { stdio: "inherit" });
// });

console.log("✅ Markdown API docs generated to /docs/api");
console.log('Cleaning api-dist directory')
clean('api-dist')