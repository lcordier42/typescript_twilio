import Link from "next/link";
import * as React from "react";

import candidates from "../lib/candidates";

export const CandidatesNav = (props: any) => {
    return (
        <div>
            {candidates.map((candidat: string, id) => (
                <li key={id}>
                    <button>
                        <Link
                            href={{
                                pathname: "/",
                                query: {
                                    candidate_id: id,
                                    role: props.role,
                                    user_id: props.user_id,
                                },
                            }}
                        >
                            <a>{candidat}</a>
                        </Link>
                    </button>
                </li>
            ))}
        </div>
    );
};
