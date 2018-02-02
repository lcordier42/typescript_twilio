import * as React from "react";

export class Messages extends React.Component<
    {
        channel: any;
        user: { id: string; username: string };
    },
    {
        messages: any[];
        newMessage: string;
    }
> {
    constructor() {
        // @ts-ignore
        super(...arguments);
        this.state = {
            messages: [],
            newMessage: "",
        };
    }

    public async componentWillMount() {
        const messagePage = await this.props.channel.getMessages();
        this.setState({ messages: messagePage.items });
        await this.props.channel.on("messageAdded", this.onMessageAdded);
        // Added to save the current channel and stay on after refresh page
        localStorage.setItem("channelLogged", this.props.channel.uniqueName);
    }

    public componentWillUnmount() {
        this.props.channel.removeListener("messageAdded", this.onMessageAdded);
    }

    public async componentWillReceiveProps(nextProps: any) {
        // If we change channel nextProps !== this.props so we have to load messages for the new channel
        if (nextProps.channel.uniqueName !== this.props.channel.uniqueName) {
            this.props.channel.removeListener(
                "messageAdded",
                this.onMessageAdded,
            );
            const messagePage = await nextProps.channel.getMessages();
            this.setState({ messages: messagePage.items });
            await nextProps.channel.on("messageAdded", this.onMessageAdded);
            // Added to save the current channel and stay on after refresh page
            localStorage.setItem(
                "channelLogged",
                this.props.channel.uniqueName,
            );
        }
    }

    public onMessageAdded = (message: string) => {
        this.setState((prevState) => ({
            messages: [...prevState.messages, message],
        }));
    }

    public render() {
        return (
            <div className="chat">
                <h3>Messages</h3>
                <p>Logged in as {this.props.user.username}</p>
                <ul className="messages">
                    {this.state.messages.map((message: any) => (
                        <li
                            key={message.sid}
                            ref={(li) => {
                                if (li) {
                                    li.scrollIntoView();
                                }
                            }}
                        >
                            <b>{message.author}:</b> {message.body}
                        </li>
                    ))}
                </ul>
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        const message = this.state.newMessage;
                        this.setState({ newMessage: "" });
                        this.props.channel.sendMessage(message);
                    }}
                >
                    <label htmlFor="message">Message: </label>
                    <input
                        type="text"
                        name="message"
                        id="message"
                        onChange={(event) => {
                            this.setState({
                                newMessage: event.target.value,
                            });
                        }}
                        value={this.state.newMessage}
                    />
                    <button type="submit" name="send">
                        Send
                    </button>
                </form>
            </div>
        );
    }
}
