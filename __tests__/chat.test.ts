import * as casual from "casual";
import * as dotenv from "dotenv";
import * as puppeteer from "puppeteer";

dotenv.config();

let candidateBrowser: puppeteer.Browser;
let candidatePage: puppeteer.Page;

let coachBrowser: puppeteer.Browser;
let coachPage: puppeteer.Page;

let employerBrowser: puppeteer.Browser;
let employerPage: puppeteer.Page;

function getLaunchOptions(...args: string[]): puppeteer.LaunchOptions {
    return {
        args: ["--disable-infobars", "--window-size=600,1000", ...args],
        headless: false,
        slowMo: 20,
    };
}

async function getPage(browser: puppeteer.Browser): Promise<puppeteer.Page> {
    const page = (await browser.pages())[0];
    page.setViewport({ width: 600, height: 1000 });

    return page;
}

async function initCandidatePage(page: puppeteer.Page) {
    await page.goto(`http://localhost:${process.env.PORT}`);
    // select "candidate" role
    await page.select("#name", "candidat");
    await page.click('[type="submit"]');
    // wait for available channels to be displayed
    await page.waitFor(".channels form li");
}

async function initCoachPage(page: puppeteer.Page) {
    await page.goto(`http://localhost:${process.env.PORT}`);
    // select "admin" role
    await page.select("#name", "coach");
    await page.click('[type="submit"]');
    // wait for available channels to be displayed
    await page.waitFor(".channels form li");
}

async function initEmployerPage(page: puppeteer.Page) {
    await page.goto(`http://localhost:${process.env.PORT}`);
    // select "employer" role
    await page.select("#name", "business");
    await page.click('[type="submit"]');
    // wait for available channels to be displayed
    await page.waitFor(".channels form li");
}

beforeAll(async () => {
    jest.setTimeout(60e3);

    coachBrowser = await puppeteer.launch(
        getLaunchOptions("--window-position=0,0"),
    );
    coachPage = await getPage(coachBrowser);
    await initCoachPage(coachPage);

    employerBrowser = await puppeteer.launch(
        getLaunchOptions("--window-position=600,0"),
    );
    employerPage = await getPage(employerBrowser);
    await initEmployerPage(employerPage);

    candidateBrowser = await puppeteer.launch(
        getLaunchOptions("--window-position=1200,0"),
    );
    candidatePage = await getPage(candidateBrowser);
    await initCandidatePage(candidatePage);
});

test("An employer can create a new chat");

test("An employer can continue an existing chat", async () => {
    // connecting
    await employerPage.click('.channels [type="submit"][name="test"]');
    await employerPage.waitFor(".chat");

    // sending a message
    const message = casual.sentence;
    await employerPage.type('input[name="message"]', message);
    await employerPage.click('button[name="send"]');

    // receiving a message
    await candidatePage.click('.channels [type="submit"][name="test"]');
    await candidatePage.waitFor(".chat");
    await candidatePage.waitFor(
        (m: string) => {
            const e = document.querySelector("ul.messages li:last-of-type");

            if (e === null) {
                return false;
            }

            return e.innerHTML === `<b>business:</b> ${m}`;
        },
        undefined,
        message,
    );
});

test("A candidate can continue an existing chat");

test("An admin can continue an existing chat");

afterAll(async () => {
    await candidateBrowser.close();
    await coachBrowser.close();
    await employerBrowser.close();
});
