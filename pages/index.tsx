import "isomorphic-fetch";
import * as React from "react";

import { ChatApp } from "../components/ChatApp";
import { Nav } from "../components/Nav";
import admins from "../lib/admins";
import candidates from "../lib/candidates";
import employers from "../lib/employers";

const IndexPage: React.SFC<{
    candidateName: string;
    role: string;
    token: string;
    username: string;
    user_id: number;
}> = ({ candidateName, role, token, username, user_id }) => {
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

(IndexPage as any).getInitialProps = async ({
    query: { candidate_id, role, user_id },
}: {
    query: {
        candidate_id: number;
        role: string;
        user_id: number;
    };
}) => {
    /* Penser à gerer erreurs 404 et 500 quand query pas bonne */

    let username = "";
    if (role === "admin") {
        username = admins[user_id];
    } else if (role === "employer") {
        username = employers[user_id];
    } else if (role === "candidate") {
        username = candidates[user_id];
    }
    const candidateName = candidates[candidate_id];
    const { token } = await fetch(
        `http://localhost:3000/token/${username}/${role}`,
        {
            method: "post",
        },
    ).then((response) => response.json());

    return { candidateName, role, token, username, user_id };
};

export default IndexPage;
