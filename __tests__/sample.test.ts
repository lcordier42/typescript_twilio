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

test.skip("sample", async () => {
    await pageCandidate.goto(`http://localhost:${process.env.PORT}`);

    await pageCoach.goto(`http://localhost:${process.env.PORT}`);

    await pageEmployer.goto(`http://localhost:${process.env.PORT}`);

    expect(true).toBe(true);
});

test.skip(
    "login candidate",
    async () => {
        await pageCandidate.goto(`http://localhost:${process.env.PORT}`);

        await pageCandidate.select('[name="username"]', "candidat"); // je suis un candidat
        await pageCandidate.click('[name="login"]'); // je me connecte
        await pageCandidate.waitFor(1000);
        // je vérifie qu'aucun channel s'affiche
        expect(await getText(pageCandidate, ".noChannelJoined")).toBe(
            "Join a channel",
        );
    },
    10000,
);

test.skip(
    "login admin",
    async () => {
        await pageEmployer.goto(`http://localhost:${process.env.PORT}`);

        await pageEmployer.select('[name="username"]', "business"); // je suis une entreprise
        await pageEmployer.click('[name="login"]'); // je me connecte
        await pageEmployer.waitFor(1000);
        // je vérifie que la partie 'admin' s'affiche
        expect(await getText(pageEmployer, ".admin")).toBeDefined();
    },
    10000,
);

test.skip(
    "logout",
    async () => {
        await pageEmployer.goto(`http://localhost:${process.env.PORT}`);

        await pageEmployer.waitFor(1000); // je suis déjà connecté grace au test précédent
        await pageEmployer.click('[name="logout"]'); // je me delog
        await pageEmployer.waitFor(1000);
        // je vérifie que je me suis bien delog
        expect(await getText(pageEmployer, ".NameBox")).toBeDefined();
    },
    10000,
);

test.skip(
    "join channel",
    async () => {
        await pageCoach.goto(`http://localhost:${process.env.PORT}`);

        await pageCoach.select('[name="username"]', "coach"); // je suis un coach
        await pageCoach.click('[name="login"]'); // je me connecte
        await pageCoach.waitFor(3000);
        await pageCoach.click('[name="test"]'); // je rejoins le channel test
        await pageCoach.waitFor(1000);
        // je vérifie que le chat s'affiche
        expect(await getText(pageCoach, ".chat")).toBeDefined();
    },
    10000,
);

test.skip(
    "send message",
    async () => {
        await pageCoach.goto(`http://localhost:${process.env.PORT}`);

        // je suis déjà dans le channel test grace au test précédent
        await pageCoach.waitFor(3000);
        await pageCoach.type('[name="message"]', "Hello World");
        await pageCoach.click('[name="send"]');
        // je vérifie que le chat s'affiche pour le moment, mais ne sait pas si
        // le message a bien été envoyé
        expect(await getText(pageCoach, ".chat")).toBeDefined();
    },
    10000,
);

test.skip(
    "create channel",
    async () => {
        await pageCoach.goto(`http://localhost:${process.env.PORT}`);

        // je suis déjà dans le channel test grace au test précédent
        await pageCoach.waitFor(3000);
        await pageCoach.type('[name="newchannel"]', "new channel");
        await pageCoach.click('[name="create"]');
        // Il faudrait vérifier si la création du channel a bien eu lieu, ou s'il existait déjà
        // qu'il a bien été rejoint, peut-être faudrait-il une fonction "delete channel"
        // pour pouvoir tester la creation? Ou creer un channel avec un nom aléatoire mais il risque d'y
        // avoir beaucoup de channels existants à la longue
        expect(await getText(pageCoach, ".chat")).toBeDefined();
    },
    10000,
);

afterAll(async () => {
    await browserCandidate.close();
    await browserCoach.close();
    await browserEmployer.close();
});
