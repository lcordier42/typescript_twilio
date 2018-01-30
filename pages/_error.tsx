import * as http from "http";
import * as React from "react";

export default class Error extends React.Component<{ statusCode: number }> {
    private static getInitialProps({
        res,
        err,
    }: {
        res: http.ServerResponse;
        err: any;
    }) {
        const statusCode = res ? res.statusCode : err ? err.statusCode : null;
        return { statusCode };
    }

    public render() {
        return (
            <p className="error">
                {this.props.statusCode
                    ? `An error ${this.props.statusCode} occurred on server`
                    : "An error occurred on client"}
            </p>
        );
    }
}
