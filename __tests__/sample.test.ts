import * as dotenv from "dotenv";
import * as puppeteer from "puppeteer";

dotenv.config();

let candidateBrowser: puppeteer.Browser;
let candidatePage: puppeteer.Page;

let adminBrowser: puppeteer.Browser;
let adminPage: puppeteer.Page;

let employerBrowser: puppeteer.Browser;
let employerPage: puppeteer.Page;

async function getText(page: puppeteer.Page, selector: string) {
    return page.evaluate((s) => {
        const element = document.querySelector<HTMLSpanElement>(s);

        if (element === null) {
            throw new Error(`Element not found (${s})`);
        }

        return element.innerText;
    }, selector);
}

beforeAll(async () => {
    const launchOptions: puppeteer.LaunchOptions = { headless: false };

    candidateBrowser = await puppeteer.launch(launchOptions);
    candidatePage = await candidateBrowser.newPage();

    adminBrowser = await puppeteer.launch(launchOptions);
    adminPage = await adminBrowser.newPage();

    employerBrowser = await puppeteer.launch(launchOptions);
    employerPage = await employerBrowser.newPage();
});

test("An empty query redirect to error page", async () => {
    await candidatePage.goto(`http://localhost:${process.env.PORT}`);

    expect(await getText(candidatePage, ".error")).toBeDefined();
});

test("A wrong query redirect to error page", async () => {
    await candidatePage.goto(`http://localhost:${process.env.PORT}?user_id=123&role=admin`);

    expect(await getText(candidatePage, ".error")).toBeDefined();
});

test.skip(
    "join channel",
    async () => {
        await adminPage.goto(`http://localhost:${process.env.PORT}`);

        await adminPage.select('[name="username"]', "coach"); // je suis un coach
        await adminPage.click('[name="login"]'); // je me connecte
        await adminPage.waitFor(3000);
        await adminPage.click('[name="test"]'); // je rejoins le channel test
        await adminPage.waitFor(1000);
        // je vérifie que le chat s'affiche
        expect(await getText(adminPage, ".chat")).toBeDefined();
    },
    10000,
);

afterAll(async () => {
    await candidateBrowser.close();
    await adminBrowser.close();
    await employerBrowser.close();
});
