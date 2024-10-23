import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { JSDOM } from "jsdom";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const jsonFolder = join(__dirname, "./mangoAds/handle-data5");
const outputFolderPath = join(__dirname, "output");

if (!fs.existsSync(outputFolderPath)) {
    fs.mkdirSync(outputFolderPath, { recursive: true });
}

const jsonFiles = fs
    .readdirSync(jsonFolder)
    .filter((file) => file.endsWith(".json"));

jsonFiles.forEach((file) => {
    const filePath = join(jsonFolder, file);
    const fileContent = fs.readFileSync(filePath, "utf8");
    let jsonData;

    try {
        jsonData = JSON.parse(fileContent);
    } catch (err) {
        console.error(`Error parsing JSON in file ${file}:`, err);
        return;
    }

    if (Array.isArray(jsonData)) {
        jsonData.forEach((item, index) => {
            if (item.post_content) {
                const dom = new JSDOM(item.post_content);
                const document = dom.window.document;

                const textContent = document.body.textContent;

                item.post_content = textContent.trim();

                console.log(`Processed item ${index} in file ${file}`);
            } else {
                console.log(
                    `Item ${index} in file ${file} does not contain 'post_content' field.`
                );
            }
        });

        const newFilePath = join(outputFolderPath, file);
        fs.writeFileSync(
            newFilePath,
            JSON.stringify(jsonData, null, 2),
            "utf8"
        );
        console.log(`Processed and saved: ${newFilePath}`);
    } else {
        console.log(`File ${file} does not contain a valid JSON array.`);
    }
});
