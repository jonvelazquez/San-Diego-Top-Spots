const { test, expect } = require('@playwright/test');
const http = require('http');
const nodeStatic = require('node-static');

const PORT = 8888;
const url = `http://localhost:${PORT}/public/index.html`;

let server;

test.setTimeout(5000);

test.beforeAll(async () => {
  const fileServer = new nodeStatic.Server('./', { cache: 0 });
  server = http.createServer((req, res) => {
    req.addListener('end', () => {
      fileServer.serve(req, res);
    }).resume();
  });

  await new Promise(resolve => server.listen(PORT, resolve));
});

test.afterAll(() => {
  server.close();
});

test.describe('Server Setup', () => {
  test('should load successfully', async ({ request }) => {
    const response = await request.get(url);
    expect(response.status()).toBe(200);
  });
});

test.describe('HTML', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(url);
  });

  test('should have an H1 with the text "San Diego Top Spots"', async ({ page }) => {
    const heading = page.locator('h1');
    await expect(heading).toHaveText('San Diego Top Spots');
  });

  test('should load the correct page title', async ({ page }) => {
    await expect(page).toHaveTitle('San Diego Top Spots');
  });
});

test.describe('Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(url);
  });

  test('should find a row with data', async ({ page }) => {
    const firstCellText = await page.locator('table tbody tr td').first().textContent();
    expect(firstCellText).toBe("Go For A Run In The San Diego Zoo Safari Park");
  });

  test('should find a link with the correct map url', async ({ page }) => {
    const mapLink = await page.locator('table tbody tr a').first().getAttribute('href');
    expect(mapLink).toBe('https://www.google.com/maps?q=33.09745,-116.99572');
  });
});