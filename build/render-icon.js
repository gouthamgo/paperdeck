// Renders build/icon.html to build/icon.png at 1024x1024 with a transparent
// background, then the accompanying npm script turns it into icon.icns.
//
//   npm run icon
//
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

const OUT = path.join(__dirname, 'icon.png');

app.disableHardwareAcceleration();

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1024,
    height: 1024,
    useContentSize: true,
    show: false,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    webPreferences: { offscreen: false },
  });

  await win.loadFile(path.join(__dirname, 'icon.html'));
  // Let the webfont-free CSS gradients settle before grabbing the frame.
  await new Promise((resolve) => setTimeout(resolve, 600));

  const image = await win.webContents.capturePage({ x: 0, y: 0, width: 1024, height: 1024 });
  fs.writeFileSync(OUT, image.toPNG());
  console.log(`wrote ${OUT} (${image.getSize().width}x${image.getSize().height})`);

  win.destroy();
  app.quit();
});
