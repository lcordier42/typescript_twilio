import * as React from "react";

class Error extends React.Component<{ statusCode: number }> {
    public static getInitialProps({ res, err }: { res: any; err: any }) {
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

export default Error;
