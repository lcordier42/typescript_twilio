import Link from "next/link";
import * as React from "react";

import { candidates } from "../lib/candidates";

export const CandidatesNav = (props: any) => (
    <div>
        {candidates.map((candidat: string, id: number) => (
            <li key={id}>
                <button type="button" name={candidat}>
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
