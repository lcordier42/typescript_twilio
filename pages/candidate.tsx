import Link from "next/link";
import * as React from "react";

import { CandidatesNav } from "../components/CandidatesNav";
import { Nav } from "../components/Nav";
import { IContext } from "../next";

interface IProps {
    role: string;
    user_id: string;
}

const CandidatePage: React.SFC<IProps> = ({ role, user_id }) => {
    return (
        <div>
            <Nav user_id={user_id} role={role} />
            <hr />
            <h1>Candidate</h1>
            <br />
            <CandidatesNav user_id={user_id} role={role} />
        </div>
    );
};

(CandidatePage as any).getInitialProps = async ({
    query: { role, user_id },
}: IContext): Promise<IProps> => {
    if (typeof role !== "string" || typeof user_id !== "string") {
        throw new Error("Wrong query");
    }
    return { role, user_id };
};

export default CandidatePage;
