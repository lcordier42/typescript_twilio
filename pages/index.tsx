import "isomorphic-fetch";
import * as React from "react";

import { ChatApp } from "../components/ChatApp";
import { Nav } from "../components/Nav";
import { admins } from "../lib/admins";
import { candidates } from "../lib/candidates";
import { employers } from "../lib/employers";
import { IContext } from "../next";
import Error from "./_error";

interface IProps {
    candidate: { id: string; username: string } | undefined;
    role: string | undefined;
    token: string | undefined;
    user: { id: string; username: string } | undefined;
    user_id: string | undefined;
}

const IndexPage: React.SFC<IProps> = ({
    candidate,
    role,
    token,
    user,
    user_id,
}) => {
    if (token === undefined || user === undefined) {
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

(IndexPage as any).getInitialProps = async ({
    query: { candidate_id, role, user_id },
}: IContext): Promise<IProps> => {
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
            break;
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
        return { candidate: undefined, role, token: undefined, user, user_id };
        // throw new Error("Wrong user id");
    }
};

export default IndexPage;
