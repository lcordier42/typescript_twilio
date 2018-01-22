import * as Koa from "koa";
import * as KoaRouter from "koa-router";
import * as koaBodyParser from "koa-bodyparser";
import * as appBuilder from "next";
import Twilio = require("twilio");
require("dotenv").load();

const config = {
    twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        apiKey: process.env.TWILIO_API_KEY,
        apiSecret: process.env.TWILIO_API_SECRET,
        chatServiceSid: process.env.TWILIO_CHAT_SERVICE_SID,
        authToken: "025c64434e4149aaf6dc15c40e7e662a",
        admin: "RL3d68dbcbf8ec4c018d36d578330309c0",
        user: "RL0dad3491bb6349a5a53458a0fc97843c",
    },
    port: 3000,
};
const AccessToken = Twilio.jwt.AccessToken;
const ChatGrant = AccessToken.ChatGrant;
const client = new Twilio.Twilio(config.twilio.accountSid, config.twilio.authToken);
const service = client.chat.services(config.twilio.chatServiceSid);

const app = appBuilder({
    conf: { poweredByHeader: false },
});
const handle = app.getRequestHandler();
app.prepare().then(() => {
    const router = new KoaRouter();
    const server = new Koa();
    server.use(koaBodyParser());

    router.get("*", async (ctx: any) => {
        await handle(ctx.req, ctx.res);
    });

    router.post("/token/:identity", async (ctx: any) => {
        const identity = ctx.params.identity;
        var permission = config.twilio.user;
        if (
            identity === "business" ||
            identity === "coach"
        )
            permission = config.twilio.admin;
        const token = new AccessToken(
            config.twilio.accountSid,
            config.twilio.apiKey,
            config.twilio.apiSecret,
        );
        const chatGrant = new ChatGrant({
            serviceSid: config.twilio.chatServiceSid,
            ttl: 10,
        });
        token.identity = identity;
        token.addGrant(chatGrant);
        ctx.set("Content-Type", "application/json");
        ctx.body = JSON.stringify({
            token: token.toJwt(),
            identity: identity,
        });
        service
        .users(identity)
        .update({
            roleSid: permission,
        })
        .then(function(response: any) {
            console.log(response);
        })
        .catch(function(error: any) {
            if (error.code === 20404) {
                service.users
                    .create({
                        identity: identity,
                        roleSid: permission,
                    })
                    .then(function(response: any) {
                        console.log(response);
                    })
                    .catch(function(error: any) {
                        console.log(error);
                    });
            } else console.log(error);
        });
    });

    server.use(async (ctx: any, next: any) => {
        ctx.res.statusCode = 200;
        await next();
    });

    server.use(router.routes());
    server.listen(config.port);
});
console.log("Server running on port" + config.port);
