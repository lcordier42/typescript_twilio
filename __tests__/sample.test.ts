import * as dotenv from "dotenv";
import * as puppeteer from "puppeteer";

dotenv.config();

let browserCandidate: puppeteer.Browser;
let pageCandidate: puppeteer.Page;

let browserCoach: puppeteer.Browser;
let pageCoach: puppeteer.Page;

let browserEmployer: puppeteer.Browser;
let pageEmployer: puppeteer.Page;

beforeAll(async () => {
    const launchOptions: puppeteer.LaunchOptions = { headless: false };

    browserCandidate = await puppeteer.launch(launchOptions);
    pageCandidate = await browserCandidate.newPage();

    browserCoach = await puppeteer.launch(launchOptions);
    pageCoach = await browserCandidate.newPage();

    browserEmployer = await puppeteer.launch(launchOptions);
    pageEmployer = await browserEmployer.newPage();
});

test("sample", async () => {
    await pageCandidate.goto(`http://localhost:${process.env.PORT}`);

    await pageCoach.goto(`http://localhost:${process.env.PORT}`);

    await pageEmployer.goto(`http://localhost:${process.env.PORT}`);

    expect(true).toBe(true);
});

afterAll(async () => {
    await browserCandidate.close();

    await browserCoach.close();

    await browserEmployer.close();
});
