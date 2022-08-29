const puppeteer = require('puppeteer');
jest.setTimeout(10000);

test('add two numbers', () => {
  const sum = 3 + 4;
  expect(sum).toBe(7);
});

test('test puppeteer', async () => {
  const browser = await puppeteer.launch({
    headless: false,
    // args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/');
  // await page.screenshot({ path: 'google.png' });
  //   await browser.close();
});
