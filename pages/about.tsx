import * as React from "react";

import { Nav } from "../components/Nav";
import { IContext } from "../next";

interface IProps {
    role: string;
    user_id: string;
}

const AboutPage: React.SFC<IProps> = ({ role, user_id }) => (
    <div>
        <Nav user_id={user_id} role={role} />
        <hr />
        <h1>About</h1>
    </div>
);

(AboutPage as any).getInitialProps = async ({
    query: { role, user_id },
}: IContext): Promise<IProps> => {
    if (typeof role !== "string" || typeof user_id !== "string") {
        throw new Error("Wrong query");
    }
    return { role, user_id };
};

export default AboutPage;
