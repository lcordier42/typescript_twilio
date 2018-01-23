import * as dotenv from "dotenv";
import * as Koa from "koa";
import * as koaBodyParser from "koa-bodyparser";
import * as KoaRouter from "koa-router";
import * as appBuilder from "next";
import Twilio = require("twilio");

dotenv.config();
const config = {
    twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        admin: "RL3d68dbcbf8ec4c018d36d578330309c0",
        apiKey: process.env.TWILIO_API_KEY,
        apiSecret: process.env.TWILIO_API_SECRET,
        authToken: "025c64434e4149aaf6dc15c40e7e662a",
        chatServiceSid: process.env.TWILIO_CHAT_SERVICE_SID,
        user: "RL0dad3491bb6349a5a53458a0fc97843c",
    },
};
const AccessToken = Twilio.jwt.AccessToken;
const ChatGrant = AccessToken.ChatGrant;
const client = new Twilio.Twilio(
    config.twilio.accountSid,
    config.twilio.authToken,
);
const service = client.chat.services(config.twilio.chatServiceSid);

const app = appBuilder({
    conf: { poweredByHeader: false },
    dev: process.env.NODE_ENV !== "production",
});
const handle = app.getRequestHandler();
app.prepare().then(() => {
    const router = new KoaRouter();
    const koa = new Koa();
    koa.use(koaBodyParser());

    router.get("*", async (ctx: any) => {
        await handle(ctx.req, ctx.res);
    });

    router.post("/token/:identity", async (ctx: any) => {
        const identity = ctx.params.identity;
        let permission = config.twilio.user;
        if (identity === "business" || identity === "coach") {
            permission = config.twilio.admin;
        }
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
            identity,
            token: token.toJwt(),
        });
        service
            .users(identity)
            .update({
                roleSid: permission,
            })
            .then((response: any) => {
                console.log(response);
            })
            .catch((error: any) => {
                if (error.code === 20404) {
                    service.users
                        .create({
                            identity,
                            roleSid: permission,
                        })
                        .then((response: any) => {
                            console.log(response);
                        })
                        .catch((err: any) => {
                            console.log(err);
                        });
                } else {
                    console.log(error);
                }
            });
    });

    koa.use(async (ctx: any, next: any) => {
        ctx.res.statusCode = 200;
        await next();
    });

    koa.use(router.routes());
    const server = koa.listen(parseInt(process.env.PORT || "3000", 10));
    // tslint:disable-next-line no-console
    console.log(JSON.stringify(server.address(), null, 4));
});
