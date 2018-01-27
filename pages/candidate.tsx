import Link from "next/link";
import * as React from "react";

import { CandidatesNav } from "../components/CandidatesNav";
import { Nav } from "../components/Nav";

const Candidate: React.SFC<{
    role: string;
    user_id: number;
}> = ({ role, user_id }) => {
    return (
        <div>
            <Nav user_id={user_id} role={role}/>
            <hr />
            <h1>Candidate</h1>
            <br />
            <CandidatesNav user_id={user_id} role={role}/>
        </div>
    );
};

(Candidate as any).getInitialProps = async ({
    query: { role, user_id },
}: {
    query: { role: string; user_id: number };
}) => {
    return { role, user_id };
};

export default Candidate;
