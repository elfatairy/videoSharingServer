const express = require("express");
const app = express();

// Mock function to fetch video data (replace with your actual logic)
async function getVideoData(videoId) {
  try {
    const response = await fetch(`https://server.infotik.co/posts/${videoId}`);
    if (!response.ok) {
      return { title: "Video not found", description: "Video not found", thumbnail: "" };
  }
  const jsonData = await response.json();
  if (jsonData && jsonData.statusCode === 200) {
    return {
      title: jsonData.data.user?.displayName ?? "Infotik",
      description: jsonData.data.description,
      thumbnail: getThumbUrl(jsonData.data.thumbnailObjectName),
    };
    }
    return { title: "Video not found", description: "Video not found", thumbnail: "" };
  } catch (error) {
    return { title: "Video not found", description: "Video not found", thumbnail: "" };
  }
}

function getThumbUrl(objectName) {
  return `https://server.infotik.co/posts/thumbnail/${objectName}`;
}


app.get("/api/:videoId", async (req, res) => {
  const { videoId } = req.params;
  const { title, description, thumbnail } = await getVideoData(videoId);

  const html = `
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <meta property="og:title" content="${title}">
        <meta property="og:description" content="${description}">
          <meta property="og:image" content="${thumbnail}">
          <meta property="og:url" content="https://${req.headers.host}/${videoId}">
          <meta property="og:type" content="video.other">
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

            #postId {
                font-size: 2rem;
                color: #333;
            }
        </style>
    </head>

    <body>
        Loading...

        <script>
            const path = window.location.pathname;
            const postId = path.split('/')[1];

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
                    // Attempt to open the app using a deep link
                    // window.location.href = \`intent://#Intent;scheme=infotik.co;package=com.zeeshan_raza.infotik;S.browser_fallback_url=${encodeURIComponent(
                      "https://play.google.com/store/apps/details?id=com.zeeshan_raza.infotik"
                    )};end\`;
                    // window.location.href = \`intent://co#Intent;scheme=infotik.co;package=com.zeeshan_raza.infotik;S.browser_fallback_url=https://play.google.com/store/apps/details?id=com.zeeshan_raza.infotik;end\`;
                    window.location.href = \`intent://${postId}#Intent;scheme=infotik.co;package=com.zeeshan_raza.infotik;S.browser_fallback_url=https://play.google.com/store/apps/details?id=com.zeeshan_raza.infotik;end\`;
                    // window.location.href = "infotik.co://"; 
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
