import * as React from "react";

import { IContext } from "../next";

interface IProps {
    statusCode: number | null;
}

const ErrorPage: React.SFC<IProps> = ({ statusCode }) => (
    <p className="error">
        {statusCode
            ? `An error ${statusCode} occurred on server`
            : "An error occurred on client"}
    </p>
);

(ErrorPage as any).getInitialProps = async ({
    err,
    res,
}: IContext): Promise<IProps> => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : null;

    return { statusCode };
};

export default ErrorPage;
