const fs = require('node:fs');
const sharp = require(require.resolve('sharp', { paths: [require.resolve('next')] }));

(async () => {
  for (const name of ['desktop-light', 'desktop-dark', 'mobile-light', 'mobile-dark', 'mobile-menu']) {
    const baseline = `browser/__snapshots__/${name}.png`;
    const actual = `test-results/visual-receipts/${name}.png`;
    if (!fs.existsSync(baseline) || !fs.existsSync(actual)) continue;
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
