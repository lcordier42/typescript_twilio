import * as dotenv from "dotenv";
import * as puppeteer from "puppeteer";

dotenv.config();

let browserCandidate: puppeteer.Browser;
let pageCandidate: puppeteer.Page;

let browserCoach: puppeteer.Browser;
let pageCoach: puppeteer.Page;

let browserEmployer: puppeteer.Browser;
let pageEmployer: puppeteer.Page;

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

    browserCandidate = await puppeteer.launch(launchOptions);
    pageCandidate = await browserCandidate.newPage();

    browserCoach = await puppeteer.launch(launchOptions);
    pageCoach = await browserCoach.newPage();

    browserEmployer = await puppeteer.launch(launchOptions);
    pageEmployer = await browserEmployer.newPage();
});

test("sample", async () => {
    await pageCandidate.goto(`http://localhost:${process.env.PORT}`);

    await pageCoach.goto(`http://localhost:${process.env.PORT}`);

    await pageEmployer.goto(`http://localhost:${process.env.PORT}`);

    expect(true).toBe(true);
});

test(
    "login candidate",
    async () => {
        await pageCandidate.goto(`http://localhost:${process.env.PORT}`);

        await pageCandidate.select('[name="name"]', "candidat"); // je suis un candidat
        await pageCandidate.click('[name="login"]'); // je me connecte
        await pageCandidate.waitFor(1000);
        // je vérifie qu'aucun channel s'affiche
        expect(await getText(pageCandidate, ".noChannelJoined")).toBe(
            "Join a channel",
        );
    },
    10000,
);

test(
    "login admin",
    async () => {
        await pageEmployer.goto(`http://localhost:${process.env.PORT}`);

        await pageEmployer.select('[name="name"]', "business"); // je suis une entreprise
        await pageEmployer.click('[name="login"]'); // je me connecte
        await pageEmployer.waitFor(1000);
        // je vérifie que la partie 'admin' s'affiche
        expect(await getText(pageEmployer, ".admin")).toBeDefined();
    },
    10000,
);

test(
    "logout",
    async () => {
        await pageCoach.goto(`http://localhost:${process.env.PORT}`);

        await pageCoach.select('[name="name"]', "coach"); // je suis un coach
        await pageCoach.click('[name="login"]'); // je me connecte
        await pageCoach.waitFor(1000);
        await pageCoach.click('[name="logout"]');
        await pageCoach.waitFor(1000);
        // je vérifie que je me suis bien delog
        expect(await getText(pageCoach, ".NameBox")).toBeDefined();
    },
    10000,
);

test(
    "join channel",
    async () => {
        await pageCoach.goto(`http://localhost:${process.env.PORT}`);

        await pageCoach.select('[name="name"]', "coach"); // je suis un coach
        await pageCoach.click('[name="login"]'); // je me connecte
        await pageCoach.waitFor(3000);
        await pageCoach.click('[name="test"]'); // je rejoins le channel test
        await pageCoach.waitFor(1000);
        // je vérifie que le chat s'affiche
        expect(await getText(pageCoach, ".chat")).toBeDefined();
    },
    10000,
);

afterAll(async () => {
    await browserCandidate.close();
    await browserCoach.close();
    await browserEmployer.close();
});
