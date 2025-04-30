const express = require("express");
const app = express();
import {
  S3Client,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY ?? "",
    secretAccessKey: process.env.S3_SECRET_KEY ?? "",
  },
});

async function getImageAsDataUri(bucketName: string, objectName: string) {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: objectName,
    });
    const response = await s3.send(command);

    if (!response.Body) {
      console.log(`File body not found for object: ${objectName}`);
      return null;
    }
    if (!response.ContentType) {
      console.log(
        `ContentType metadata missing for object: ${objectName}. Cannot create Data URI.`
      );
      return null;
    }

    const mimeType = response.ContentType;
    const bytearray = await response.Body.transformToByteArray();
    const buffer = Buffer.from(bytearray);

    const base64Data = buffer.toString("base64");

    const dataUri = `data:${mimeType};base64,${base64Data}`;

    console.log(
      `Generated Data URI for ${objectName} (type: ${mimeType}), length: ${dataUri.length}`
    );
    return dataUri;
  } catch (error) {
    if (error.name === "NoSuchKey") {
      console.log(
        `Error: Object ${objectName} not found in bucket ${bucketName}.`
      );
    } else {
      console.error(`Error fetching object ${objectName} from S3:`, error);
    }
    return null;
  }
}

async function getVideoData(videoId) {
  try {
    const response = await fetch(`https://server.infotik.co/posts/${videoId}`);
    if (!response.ok) {
      console.log("not ok");
      return {
        title: "Video not found",
        description: "Video not found",
        thumbnail: "",
      };
    }
    const jsonData = await response.json();
    if (jsonData && jsonData.statusCode === 200) {
      console.log("jsonData.data.thumbnailObjectName", jsonData.data.thumbnailObjectName)
      return {
        title: jsonData.data.user?.displayName ?? "Infotik",
        description: jsonData.data.description,
        thumbnail: await getImageAsDataUri(process.env.THUMBNAILS_BUCKET ?? "", jsonData.data.thumbnailObjectName) ?? ""
      };
    }

    return {
      title: "Video not found",
      description: "Video not found",
      thumbnail: "",
    };
  } catch (error) {
    console.log("error");
    console.log(error);

    return {
      title: "Video not found",
      description: "Video not found",
      thumbnail: "",
    };
  }
}

async function getPulseData(videoId) {
  try {
    const response = await fetch(`https://server.infotik.co/pulse/${videoId}`);
    if (!response.ok) {
      return {
        title: "Video not found",
        description: "Video not found",
        thumbnail: "",
      };
    }
    const jsonData = await response.json();
    if (jsonData && jsonData.statusCode === 200) {
      return {
        title: jsonData.data.user?.displayName ?? "Infotik",
        description: jsonData.data.description,
        thumbnail: getThumbUrl(jsonData.data.thumbnailObjectName),
      };
    }

    return {
      title: "Video not found",
      description: "Video not found",
      thumbnail: "",
    };
  } catch (error) {
    console.log("error");
    console.log(error);

    return {
      title: "Video not found",
      description: "Video not found",
      thumbnail: "",
    };
  }
}

function getThumbUrl(objectName) {
  return `https://server.infotik.co/posts/thumbnail/${objectName}`;
}

app.get("/", (req, res) => {
  console.log("redirecting to infotik.co");
  res.redirect("https://www.infotik.co");
});

app.get("/video/:videoId", async (req, res) => {
  console.log("requesting video", req.params.videoId);
  const { videoId } = req.params;
  const { title, description, thumbnail } = await getVideoData(videoId);
  console.log("title", title);
  console.log("description", description); 
  console.log("thumbnail", thumbnail);

  const html = `
    <!DOCTYPE html>
    <html lang="en" prefix="og: https://ogp.me/ns#">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <meta name="description" content="${description}">

        <!-- Facebook Meta Tags -->
        <meta property="og:url" content="https://app.infotik.co/video/${videoId}">
        <meta property="og:type" content="video.other">
        <meta property="og:title" content="${title}">
        <meta property="og:description" content="${description}">
        <meta property="og:image" content="${thumbnail}">

        <!-- Twitter Meta Tags -->
        <meta name="twitter:card" content="summary_large_image">
        <meta property="twitter:domain" content="app.infotik.co">
        <meta property="twitter:url" content="https://app.infotik.co/video/${videoId}">
        <meta name="twitter:title" content="${title}">
        <meta name="twitter:description" content="${description}">
        <meta name="twitter:image" content="${thumbnail}">

        <!-- Meta Tags Generated via https://www.opengraph.xyz -->
        </head>
        <style>
            body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background-color: #f5f5f5;
            }
        </style>
    </head>

    <body>
      Loading...

      <script>
        function detectDevice() {
          const userAgent = navigator.userAgent || navigator.vendor || window.opera;

          if (/android/i.test(userAgent)) {
              return 'android';
          }

          if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
              return 'ios';
          }

          return 'web';
        }

        function redirectBasedOnDevice() {
            const deviceType = detectDevice();

            if (deviceType === 'android') {
                window.location.href = \`intent://video/${videoId}#Intent;scheme=infotik.co;package=com.zeeshan_raza.infotik;S.browser_fallback_url=https://play.google.com/store/apps/details?id=com.zeeshan_raza.infotik;end\`;
            } else if (deviceType === 'web') {
                // Redirect web users to the website
                window.location.href = 'https://www.infotik.co';
            }
            // Do nothing for iOS
        }

        // Execute redirection logic
        redirectBasedOnDevice();
      </script>

    </body>

    </html>
  `;

  res.send(html);
});

app.get("/pulse/:pulseId", async (req, res) => {
  const { pulseId } = req.params;
  const { title, description, thumbnail } = await getPulseData(pulseId);

  const html = `
    <!DOCTYPE html>
    <html lang="en" prefix="og: https://ogp.me/ns#">

    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <meta name="description" content="${description}">

      <!-- Facebook Meta Tags -->
      <meta property="og:url" content="https://app.infotik.co/pulse/${pulseId}">
      <meta property="og:type" content="article">
      <meta property="og:title" content="${title}">
      <meta property="og:description" content="${description}">
      <meta property="og:image" content="${thumbnail}">

      <!-- Twitter Meta Tags -->
      <meta name="twitter:card" content="summary_large_image">
      <meta property="twitter:domain" content="app.infotik.co">
      <meta property="twitter:url" content="https://app.infotik.co/pulse/${pulseId}">
      <meta name="twitter:title" content="${title}">
      <meta name="twitter:description" content="${description}">
      <meta name="twitter:image" content="${thumbnail}">
      <style>
          body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background-color: #f5f5f5;
          }
      </style>
    </head>

    <body>
      Loading...

      <script>
        function detectDevice() {
          const userAgent = navigator.userAgent || navigator.vendor || window.opera;

          if (/android/i.test(userAgent)) {
              return 'android';
          }

          if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
              return 'ios';
          }

          return 'web';
        }

        function redirectBasedOnDevice() {
            const deviceType = detectDevice();

            if (deviceType === 'android') {
                window.location.href = \`intent://pulse/${pulseId}#Intent;scheme=infotik.co;package=com.zeeshan_raza.infotik;S.browser_fallback_url=https://play.google.com/store/apps/details?id=com.zeeshan_raza.infotik;end\`;
            } else if (deviceType === 'web') {
                // Redirect web users to the website
                window.location.href = 'https://www.infotik.co';
            }
            // Do nothing for iOS
        }

        // Execute redirection logic
        redirectBasedOnDevice();
      </script>

    </body>

    </html>
  `;

  res.send(html);
});

// Export the app for Vercel
module.exports = app;
