// tools/convert-icon.js
const iconGen = require('icon-gen');

async function makeIcons() {
  try {
    await iconGen('./web/assets/icon.png', 'resources', {
      report: true,
      modes: ['ico', 'icns', 'png'],
      ico: { sizes: [16, 24, 32, 48, 64, 128, 256, 512] },
      icns: { sizes: [16, 32, 64, 128, 256, 512, 1024] },
      png: { sizes: [512, 256, 128, 64, 48, 32, 16] }
    });
    console.log('Icons generated into /resources');
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

makeIcons();