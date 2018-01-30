import "isomorphic-fetch";
import * as React from "react";

import { Context } from "koa";
import { ChatApp } from "../components/ChatApp";
import { Nav } from "../components/Nav";
import { admins } from "../lib/admins";
import { candidates } from "../lib/candidates";
import { employers } from "../lib/employers";
import Error from "./_error";

const IndexPage: React.SFC<{
    candidate: { id: string; username: string } | undefined;
    role: string;
    token: string;
    user: { id: string; username: string };
    user_id: number;
}> = ({ candidate, role, token, user, user_id }) => {
    if (token === undefined) {
        // throw new Error("Can't get token");
        return <Error statusCode={404} />;
    }
    if (role === "candidate" && candidate !== undefined) {
        candidate = undefined;
    }
    return (
        <div>
            <Nav role={role} user_id={user_id} />
            <hr />
            <h1>Index</h1>
            <ChatApp
                candidate={candidate}
                role={role}
                token={token}
                user={user}
            />
        </div>
    );
};

(IndexPage as any).getInitialProps = async (ctx: Context) => {
    const {
        query: { candidate_id, role, user_id },
    }: { query: { candidate_id: string; role: string; user_id: string } } = ctx;
    let user;
    switch (role) {
        case "admin":
            user = admins.find((admin) => admin.id === user_id);
            break;
        case "employer":
            user = employers.find((employer) => employer.id === user_id);
            break;
        case "candidate":
            user = candidates.find((candidat) => candidat.id === user_id);
            break;
        default:
            return <Error statusCode={404} />;
        // throw new Error("The role: " + role + " doesn't exist");
    }
    if (user) {
        const candidate = candidates.find(
            (candidat) => candidat.id === candidate_id,
        );
        const { token } = await fetch(
            `http://localhost:3000/token/${user.username}/${role}`,
            {
                method: "post",
            },
        ).then((response) => response.json());

        return { candidate, role, token, user, user_id };
    } else {
        return <Error statusCode={404} />;
        // throw new Error("Wrong user id");
    }
};

export default IndexPage;
