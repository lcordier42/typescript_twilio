import Link from "next/link";
import * as React from "react";

export const Nav = (props: any) => {
    return (
        <ul className="nav">
            <li>
                <Link
                    href={{
                        pathname: "/",
                        query: {
                            role: props.role,
                            user_id: props.user_id,
                        },
                    }}
                >
                    <a>Index</a>
                </Link>
            </li>
            <li>
                <Link
                    href={{
                        pathname: "/candidate",
                        query: {
                            role: props.role,
                            user_id: props.user_id,
                        },
                    }}
                >
                    <a>Candidate</a>
                </Link>
            </li>
            <li>
                <Link
                    href={{
                        pathname: "/about",
                        query: {
                            role: props.role,
                            user_id: props.user_id,
                        },
                    }}
                >
                    <a>About</a>
                </Link>
            </li>
        </ul>
    );
};
