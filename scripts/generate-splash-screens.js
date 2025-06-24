const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const splashScreens = [
  { width: 750, height: 1334, name: "screenshot-narrow.png" },
  { width: 1280, height: 800, name: "screenshot-wide.png" }
];

const inputFile = path.join(__dirname, "../public/icons/icon.svg");
const outputDir = path.join(__dirname, "../public/splash");

async function generateSplashScreens() {
  console.log("🎨 Generating splash screens...");

  try {
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate splash screens
    for (const screen of splashScreens) {
      const outputFile = path.join(outputDir, screen.name);
      
      // Create a white background
      const background = Buffer.from(`
        <svg width="${screen.width}" height="${screen.height}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#ffffff"/>
        </svg>
      `);

      // Composite the icon onto the background
      await sharp(background)
        .composite([{
          input: inputFile,
          top: Math.floor((screen.height - 256) / 2),
          left: Math.floor((screen.width - 256) / 2),
          width: 256,
          height: 256
        }])
        .png()
        .toFile(outputFile);
      
      console.log(`✅ Generated ${screen.name}`);
    }

    console.log("🎉 All splash screens generated successfully!");
  } catch (error) {
    console.error("❌ Error generating splash screens:", error);
    process.exit(1);
  }
}

generateSplashScreens();
