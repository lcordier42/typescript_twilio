import * as Koa from "koa";
import * as KoaRouter from "koa-router";
import * as koaBodyParser from "koa-bodyparser";
import Twilio = require("twilio");
require("dotenv").load();

const config = {
    twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        apiKey: process.env.TWILIO_API_KEY,
        apiSecret: process.env.TWILIO_API_SECRET,
        chatServiceSid: process.env.TWILIO_CHAT_SERVICE_SID,
        authToken: "025c64434e4149aaf6dc15c40e7e662a",
    },
    port: 3000,
};
const AccessToken = Twilio.jwt.AccessToken;
const ChatGrant = AccessToken.ChatGrant;

const app = new Koa();
app.use(koaBodyParser());
const router = new KoaRouter();

router.get('/', async (ctx) => {
    ctx.body = 'Hello World!';
});

router.post("/token/:identity", async (ctx) => {
    const identity = ctx.params.identity;
    const token = new AccessToken(
        config.twilio.accountSid,
        config.twilio.apiKey,
        config.twilio.apiSecret,
    );
    const chatGrant = new ChatGrant({
        serviceSid: config.twilio.chatServiceSid,
    });
    token.identity = identity;
    token.addGrant(chatGrant);
    ctx.set("Content-Type", "application/json");
    ctx.body = JSON.stringify({
        token: token.toJwt(),
        identity: identity,
    });
});

app.use(router.routes());
app.listen(config.port);

console.log("Server running on port" + config.port);
