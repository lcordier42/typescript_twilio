import * as http from "http";

interface IError extends Error {
    statusCode: number;
}

export interface IContext {
    asPath: string;
    err?: IError;
    jsonPageRes?: Response;
    pathname: string;
    query: {
        [key: string]:
            | boolean
            | boolean[]
            | number
            | number[]
            | string
            | string[]
            | undefined;
    };
    req?: http.IncomingMessage;
    res?: http.ServerResponse;
}
