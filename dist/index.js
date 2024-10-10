"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const aws_sdk_1 = require("aws-sdk");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const s3 = new aws_sdk_1.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
const PORT = process.env.PORT || 3001;
app.get("/*", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const host = req.hostname;
        let id;
        // Extract the ID for your custom domain
        if (host.endsWith("dhruvsood.in")) {
            // For custom domains like abcde.dhruvsood.in
            const subdomains = host.split(".");
            id = subdomains[0]; // This will get 'abcde'
        }
        else if (host.includes("onrender.com")) {
            const subdomains = host.split(".");
            id = subdomains[0]; // This will get '4aa6d'
        }
        else if (host.includes("nip.io")) {
            id = host.split(".")[0];
        }
        else if (host.includes("localtest.me")) {
            id = host.split(".")[0];
        }
        else {
            id = host.split(".")[0];
        }
        const filePath = req.path || "/index.html"; // Default to index.html if no path
        console.log({
            host,
            id,
            filePath,
            fullPath: `dist/${id}${filePath}`,
        });
        const contents = yield s3
            .getObject({
            Bucket: "cloudcode123",
            Key: `dist/${id}${filePath}`,
        })
            .promise();
        const mimeTypes = {
            ".html": "text/html",
            ".css": "text/css",
            ".js": "application/javascript",
            ".json": "application/json",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".gif": "image/gif",
            ".svg": "image/svg+xml",
        };
        const ext = ((_a = filePath.match(/\.[^.]*$/)) === null || _a === void 0 ? void 0 : _a[0]) || "";
        const contentType = mimeTypes[ext] || "application/octet-stream";
        res.set("Content-Type", contentType);
        res.send(contents.Body);
    }
    catch (error) {
        console.error("Error serving file:", error);
        res.status(error.statusCode || 500).send(error.message);
    }
}));
app.listen(3001);
