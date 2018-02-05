import * as React from "react";

export class LastMessages extends React.Component<{
    lastMessages: any[];
}> {
    public render() {
        return (
            <div className="last_messages">
                <b>Last messages:</b>
                {this.props.lastMessages.map((message, i) => (
                    // Can't use message.sid for the key, because when a conversation is empty, message is undefined
                    <li key={i}>
                        {message === undefined
                            ? "Empty conversation"
                            : message.body}
                    </li>
                ))}
            </div>
        );
    }
}
