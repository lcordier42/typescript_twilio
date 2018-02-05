import * as React from "react";

export class Channels extends React.Component<{
    channels: any[];
    // what is the type of a function?
    joinChannel: any;
}> {
    public render() {
        return (
            <div className="channels">
                <b>Join a channel: </b>
                {this.props.channels
                    .sort((a, b) => b.dateCreated - a.dateCreated)
                    .map((channel) => (
                        <li key={channel.sid}>
                            <button
                                type="submit"
                                name={channel.uniqueName}
                                onClick={this.props.joinChannel}
                            >
                                {channel.uniqueName}
                            </button>
                        </li>
                    ))}
            </div>
        );
    }
}
