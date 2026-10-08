const fs = require('node:fs');
const sharp = require(require.resolve('sharp', { paths: [require.resolve('next')] }));

(async () => {
  for (const name of ['desktop-light', 'desktop-dark', 'mobile-light', 'mobile-dark', 'mobile-menu']) {
    const baseline = `browser/__snapshots__/${name}.png`;
    const actual = `test-results/visual-receipts/${name}.png`;
    if (process.env.LOG_BASELINE_PNGS === '1' && fs.existsSync(baseline)) {
      console.log(`PORTFOLIO_BASELINE_${name.toUpperCase().replaceAll('-', '_')}=${fs.readFileSync(baseline).toString('base64')}`);
    }
    if (!fs.existsSync(baseline) || !fs.existsSync(actual)) continue;
    const originalPixels = await sharp(baseline).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const currentPixels = await sharp(actual).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    if (originalPixels.info.width === currentPixels.info.width && originalPixels.info.height === currentPixels.info.height) {
      let changed = 0;
      let minX = Infinity, minY = Infinity, maxX = -1, maxY = -1;
      for (let i = 0; i < originalPixels.data.length; i += 4) {
        if (!originalPixels.data.subarray(i, i + 4).equals(currentPixels.data.subarray(i, i + 4))) {
          changed++;
          const x = (i / 4) % originalPixels.info.width;
          const y = Math.floor(i / 4 / originalPixels.info.width);
          minX = Math.min(minX, x); minY = Math.min(minY, y);
          maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
        }
      }
      console.log(`PORTFOLIO_PIXEL_METRIC ${name} ${changed}/${originalPixels.info.width * originalPixels.info.height} raw RGBA pixels differ; bounding box ${changed ? `${minX},${minY}-${maxX},${maxY}` : 'none'}`);
    }
    const left = await sharp(baseline).resize({ width: 400 }).png().toBuffer();
    const right = await sharp(actual).resize({ width: 400 }).png().toBuffer();
    const a = await sharp(left).metadata();
    const b = await sharp(right).metadata();
    const bytes = await sharp({ create: { width: 800, height: Math.max(a.height, b.height), channels: 3, background: 'white' } })
      .composite([{ input: left, left: 0, top: 0 }, { input: right, left: 400, top: 0 }])
      .jpeg({ quality: 72 }).toBuffer();
    fs.writeFileSync(`test-results/visual-receipts/${name}-comparison.jpg`, bytes);
    console.log(`PORTFOLIO_COMPARISON_${name.toUpperCase().replaceAll('-', '_')}=${bytes.toString('base64')}`);
    console.log(`${name}: historical baseline on the left, upgraded portfolio on the right.`);
  }
})().catch(error => { console.error(error); process.exit(1); });
