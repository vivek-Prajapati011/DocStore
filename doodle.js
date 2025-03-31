import { open, readdir, readFile } from "fs/promises";
import http from "http";
import mime from "mime-types";

const server = http.createServer(async (req, res) => {
  console.log(req.url);

  if (req.url === "/favicon.ico") return res.end("No favicon.");
  if (req.url === "/") {
    serveDirectory(req, res);
  } else {
    try {
      const [url, queryString] = req.url.split("?");
      const queryParam = {};
      queryString.split("&").forEach((pair) => {
        const [key, value] = pair.split("=");
        queryParam[key] = value;
      });
      console.log(queryParam);

      const fileHandle = await open(`./storage${decodeURIComponent(url)}`);
      const stats = await fileHandle.stat();
      if (stats.isDirectory()) {
        serveDirectory(req, res);
      } else {
        const readStream = fileHandle.createReadStream();
        res.setHeader("Content-Type", mime.contentType(url.slice(1)));
        res.setHeader("Content-Length", stats.size)
        if (queryParam.action === "download") {
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${url.slice(1)}"`
          );
        }
        readStream.pipe(res);
      }
    } catch (err) {
      console.log(err.message);
      res.end("Not Found!");
    }
  }
});

async function serveDirectory(req, res) {
  const [url, queryString] = req.url.split("?");
  console.log("hiii", { url, queryString });
  const itemsList = await readdir(`./storage${url}`);
  let dynamicHTML = "";
  itemsList.forEach((item) => {
    dynamicHTML += `${item} <a href=".${
      req.url === "/" ? "" : req.url
    }/${item}?action=open">Open</a> <a href=".${
      req.url === "/" ? "" : req.url
    }/${item}?action=download">Download</a><br>`;
  });
  const htmlBoilerplate = await readFile("./boilerplate.html", "utf-8");
  res.end(htmlBoilerplate.replace("${dynamicHTML}", dynamicHTML));
}

server.listen(80, "0.0.0.0", () => {
  console.log("Server started");
});
