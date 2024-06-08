import express from "express";
import { createReadStream, readFileSync, statSync } from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/video", (req, res) => {
  const filepath = `${__dirname}/public/video.mp4`;
  const stat = statSync(filepath);
  const fileSize = stat.size;

  const range = req.headers.range;

  if (!range) {
    res.status(400).send("Requires Range header");
    return;
  }

  const chunkSize = 10 ** 6;
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + chunkSize, fileSize - 1);

  const contentLength = end - start + 1;

  const fileStream = createReadStream(filepath, {
    start,
    end,
  });

  fileStream.pipe(res);

  const header = {
    "Content-Range": `bytes ${start}-${end}/${fileSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };
  res.writeHead(206, header);
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
