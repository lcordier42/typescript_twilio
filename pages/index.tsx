import "isomorphic-fetch";
import * as React from "react";

import { ChatApp } from "../components/ChatApp";
import { Nav } from "../components/Nav";

const IndexPage: React.SFC<{
    role: string;
    token: string;
    username: string;
}> = ({ role, token, username }) => (
    <div>
        <Nav />
        <hr />
        <h1>Index</h1>
        <ChatApp role={role} token={token} username={username} />
    </div>
);

(IndexPage as any).getInitialProps = async ({
    query: { role, username },
}: {
    query: { role: string; username: string };
}) => {
    const { token } = await fetch(
        `http://localhost:3001/token/${username}/${role}`,
        {
            method: "post",
        },
    ).then((response) => response.json());

    return { role, token, username };
};

export default IndexPage;
