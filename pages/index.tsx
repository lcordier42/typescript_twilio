import "isomorphic-fetch";
import * as React from "react";

import { Context } from "koa";
import { ChatApp } from "../components/ChatApp";
import { Nav } from "../components/Nav";
import admins from "../lib/admins";
import candidates from "../lib/candidates";
import employers from "../lib/employers";
import Error from "./_error";

const IndexPage: React.SFC<{
    candidateName: string | undefined;
    role: string;
    token: string;
    username: string;
    user_id: number;
}> = ({ candidateName, role, token, username, user_id }) => {
    if (!token) {
        return <Error statusCode={404} />;
        // throw new Error("Can't get token");
    }
    if (role === "candidate" && candidateName !== undefined) {
        candidateName = undefined;
    }
    return (
        <div>
            <Nav role={role} user_id={user_id} />
            <hr />
            <h1>Index</h1>
            <ChatApp
                candidateName={candidateName}
                role={role}
                token={token}
                username={username}
            />
        </div>
    );
};

(IndexPage as any).getInitialProps = async (ctx: Context) => {
    const { query: { candidate_id, role, user_id } } = ctx;
    let username = "";
    if (role === "admin") {
        username = admins[user_id];
    } else if (role === "employer") {
        username = employers[user_id];
    } else if (role === "candidate") {
        username = candidates[user_id];
    }
    const candidateName = candidates[candidate_id];
    if (username !== "" && username !== undefined) {
        const { token } = await fetch(
            `http://localhost:3000/token/${username}/${role}`,
            {
                method: "post",
            },
        ).then((response) => response.json());
        return { candidateName, role, token, username, user_id };
    } else {
        return {};
    }
};

export default IndexPage;
