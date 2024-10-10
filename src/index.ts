import express from "express";
import { S3 } from "aws-sdk";
import dotenv from "dotenv";

dotenv.config();
const app = express();

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const PORT = process.env.PORT || 3001;

app.get("/*", async (req, res) => {
  try {
    const host = req.hostname;
    let id;

    if (host.includes("onrender.com")) {
      // For render URLs like https://4aa6d.skycode-2.onrender.com
      // We want to extract '4aa6d' from the subdomain
      const subdomains = host.split(".");
      id = subdomains[0]; // This will get '4aa6d'
    } else if (host.includes("nip.io")) {
      id = host.split(".")[0];
    } else if (host.includes("localtest.me")) {
      id = host.split(".")[0];
    } else {
      id = host.split(".")[0];
    }

    const filePath = req.path || "/index.html"; // Default to index.html if no path
    console.log({
      host,
      id,
      filePath,
      fullPath: `dist/${id}${filePath}`,
    });

    const contents = await s3
      .getObject({
        Bucket: "cloudcode123",
        Key: `dist/${id}${filePath}`,
      })
      .promise();

    const mimeTypes: Record<string, string> = {
      ".html": "text/html",
      ".css": "text/css",
      ".js": "application/javascript",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
    };

    const ext = filePath.match(/\.[^.]*$/)?.[0] || "";
    const contentType = mimeTypes[ext] || "application/octet-stream";

    res.set("Content-Type", contentType);
    res.send(contents.Body);
  } catch (error: any) {
    console.error("Error serving file:", error);
    res.status(error.statusCode || 500).send(error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`You can access your deployments using the following formats:`);
  console.log(`- http://[project-id].127.0.0.1.nip.io:${PORT}`);
  console.log(`- http://[project-id].localtest.me:${PORT}`);
  console.log(`- https://[project-id].your-app-name.onrender.com`);
});
