import * as React from "react";

import { ChatApp } from "../components/ChatApp";

const IndexPage: React.SFC<{ url: { query: { role?: string, username?: string } } }> = ({
    url: { query: { role = "unknown", username = "anonymous" } },
}) => (
    <div>
        <header>
            <h1>Test Chat</h1>
        </header>
        <hr />
        <ChatApp role={role} username={username} />
    </div>
);

export default IndexPage;
