const express = require("express");
const app = express();

// Mock function to fetch video data (replace with your actual logic)
async function getVideoData(videoId) {
  try {
    const response = await fetch(`https://server.infotik.co/posts/${videoId}`);
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
  res.redirect("https://www.infotik.co");
});

app.get("/video/:videoId", async (req, res) => {
  const { videoId } = req.params;
  const { title, description, thumbnail } = await getVideoData(videoId);

  const html = `
    <!DOCTYPE html>
    <html lang="en" prefix="og: https://ogp.me/ns#">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <!-- HTML Meta Tags -->
        <title>The Rock</title>
        <meta name="description" content="">

        <!-- Facebook Meta Tags -->
        <meta property="og:url" content="https://app.infotik.co/pulse/eefde923-91a5-4389-be9d-26b649bceb20">
        <meta property="og:type" content="website">
        <meta property="og:title" content="The Rock">
        <meta property="og:description" content="some random description">
        <meta property="og:image" content="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1Dk9LNEL8ZYps1GGzR2kC_3TcExANdy_06g&s">

        <!-- Twitter Meta Tags -->
        <meta name="twitter:card" content="summary_large_image">
        <meta property="twitter:domain" content="app.infotik.co">
        <meta property="twitter:url" content="https://app.infotik.co/pulse/eefde923-91a5-4389-be9d-26b649bceb20">
        <meta name="twitter:title" content="The Rock">
        <meta name="twitter:description" content="">
        <meta name="twitter:image" content="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1Dk9LNEL8ZYps1GGzR2kC_3TcExANdy_06g&s">

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
        <meta property="og:title" content="The Rock" />
        <meta property="og:type" content="video.movie" />
        <meta property="og:url" content="https://www.imdb.com/title/tt0117500/" />
        <meta property="og:image" content="https://ia.media-imdb.com/images/rock.jpg" />
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
