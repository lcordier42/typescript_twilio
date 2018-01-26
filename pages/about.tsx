import * as React from "react";

import { Nav } from "../components/Nav";

const About: React.SFC<{
    role: string;
    user_id: number;
}> = ({ role, user_id }) => (
    <div>
        <Nav user_id={user_id} role={role} />
        <hr />
        <h1>About</h1>
    </div>
);

(About as any).getInitialProps = async ({
    query: { role, user_id },
}: {
    query: { role: string, user_id: number };
}) => {
    if (!user_id) {
        user_id = 0;
    }
    return { role, user_id };
};

export default About;
