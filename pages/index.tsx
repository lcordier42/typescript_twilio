import "isomorphic-fetch";
import * as React from "react";

import { Context } from "koa";
import { ChatApp } from "../components/ChatApp";
import { Nav } from "../components/Nav";
import { admins } from "../lib/admins";
import { candidates } from "../lib/candidates";
import { employers } from "../lib/employers";

const IndexPage: React.SFC<{
    candidateName: string | undefined;
    role: string;
    token: string;
    username: string;
    user_id: number;
}> = ({ candidateName, role, token, username, user_id }) => {
    if (!token) {
        throw new Error("Can't get token");
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
    const {
        query: { candidate_id, role, user_id },
    }: { query: { candidate_id: string; role: string; user_id: string } } = ctx;
    let user;
    switch (role) {
        case "admin":
            user = admins.find((admin) => {
                return admin.id === user_id;
            });
            break;
        case "employer":
            user = employers.find((employer) => {
                return employer.id === user_id;
            });
            break;
        case "candidate":
            user = candidates.find((candidat) => {
                return candidat.id === user_id;
            });
            break;
        default:
            throw new Error("Wrong role in query");
    }
    if (user) {
        const candidate = candidates.find((candidat) => {
            return candidat.id === candidate_id;
        });
        const candidateName = candidate ? candidate.username : "";
        const username = user.username;
        const { token } = await fetch(
            `http://localhost:3000/token/${user.username}/${role}`,
            {
                method: "post",
            },
        ).then((response) => response.json());
        return { candidateName, role, token, username, user_id };
    } else {
        throw new Error("Wrong user id");
    }
};

export default IndexPage;
