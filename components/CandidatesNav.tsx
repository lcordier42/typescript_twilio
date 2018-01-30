import Link from "next/link";
import * as React from "react";

import { candidates } from "../lib/candidates";

export const CandidatesNav = (props: any) => (
    <div>
        {candidates.map((candidate) => (
            <li key={candidate.id}>
                <button type="button" name={candidate.username}>
                    <Link
                        href={{
                            pathname: "/",
                            query: {
                                candidate_id: candidate.id,
                                role: props.role,
                                user_id: props.user_id,
                            },
                        }}
                    >
                        <a>{candidate.username}</a>
                    </Link>
                </button>
            </li>
        ))}
    </div>
);
