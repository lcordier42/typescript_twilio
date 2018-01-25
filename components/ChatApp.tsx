import * as React from "react";
import Chat from "twilio-chat";

export class ChatApp extends React.Component<
    {
        role: string;
        token: string;
        username: string;
    },
    {
        channels: string[];
        inviteUser: string;
        messages: string[];
        newChannel: string;
        newMessage: string;
        offlineMembers: string[];
        onlineMembers: string[];
        username: string;
    }
> {
    private channel: any;
    private chatClient: Chat | undefined;

    constructor() {
        // @ts-ignore
        super(...arguments);
        this.state = {
            channels: [],
            inviteUser: "",
            messages: [],
            newChannel: "",
            newMessage: "",
            offlineMembers: [],
            onlineMembers: [],
            username: "",
        };
    }

    public async componentDidMount() {
        this.chatClient = await Chat.create(this.props.token);
        this.chatClient.on("channelAdded", (channel: any) => {
            this.setState((prevState, props) => ({
                channels: [...prevState.channels, channel.uniqueName],
            }));
        });
        const channelName = sessionStorage.getItem("loggedChannel") || "";
        if (channelName !== "") {
            const channel = await this.chatClient.getChannelByUniqueName(
                channelName,
            );
            this.channel = channel;
            const messagePage = await this.channel.getMessages();
            this.messagesLoaded(messagePage);
            this.channel.on("messageAdded", this.messageAdded);
            const members = await this.channel.getMembers();
            this.memberAdded(members);
        }
    }

    public componentWillUnmount() {
        sessionStorage.removeItem("username");
        sessionStorage.removeItem("loggedChannel");
        if (this.chatClient !== undefined) {
            this.chatClient.shutdown();
        }
    }

    public messagesLoaded = (messagePage: any) => {
        this.setState({ messages: messagePage.items });
    }

    public messageAdded = (message: string) => {
        this.setState((prevState, props) => ({
            messages: [...prevState.messages, message],
        }));
    }

    public memberAdded = (members: string[]) => {
        this.setState({ onlineMembers: [] });
        this.setState({ offlineMembers: [] });
        members.map(async (member: any) => {
            const user = await member.getUser();
            if (user.online === true) {
                this.setState((prevState, props) => ({
                    onlineMembers: [
                        ...prevState.onlineMembers,
                        member.identity,
                    ],
                }));
            } else {
                this.setState((prevState, props) => ({
                    offlineMembers: [
                        ...prevState.offlineMembers,
                        member.identity,
                    ],
                }));
            }
        });
    }

    public render() {
        return (
            <main>
                <header>
                    <h2>Role: {this.props.role}</h2>
                    <h3>Username: {this.props.username}</h3>
                </header>
                <style>{`
                    .admin {
                        position: relative;
                        top: 130px;
                        width: 400px;
                    }

                    .messages {
                        list-style-type: none;
                        height: 350px;
                        overflow-y: scroll;
                        padding: 0;
                        margin: 0;
                    }

                    .messages li {
                        margin-bottom: 0.5em;
                        padding: 1em 0.5em;
                        background-color: #e8e8e8;
                    }
                `}</style>
                <div>
                    {this.chatClient === undefined ? (
                        <div>
                            <h1>Chat client is undefined</h1>
                        </div>
                    ) : (
                        <div>
                            <div className="channels">
                                <label>Join a channel: </label>
                                <form
                                    onSubmit={async (event) => {
                                        event.preventDefault();
                                        if (this.channel) {
                                            this.channel.removeListener(
                                                "messageAdded",
                                                this.messageAdded,
                                            );
                                        }

                                        const channel = await this.chatClient.getChannelByUniqueName(
                                            this.state.newChannel,
                                        );

                                        this.channel = channel;
                                        sessionStorage.setItem(
                                            "loggedChannel",
                                            channel.uniqueName,
                                        );

                                        const messages = await this.channel.getMessages();
                                        this.messagesLoaded(messages);
                                        this.channel.on(
                                            "messageAdded",
                                            this.messageAdded,
                                        );

                                        const members = await this.channel.getMembers();
                                        this.memberAdded(members);

                                        this.setState({ newChannel: "" });
                                    }}
                                >
                                    {this.state.channels.map((channel, i) => (
                                        <li key={i}>
                                            <button
                                                type="submit"
                                                name={channel}
                                                onClick={(event: any) => {
                                                    this.setState({
                                                        newChannel:
                                                            event.target.value,
                                                    });
                                                }}
                                                value={channel}
                                            >
                                                {channel}
                                            </button>
                                        </li>
                                    ))}
                                </form>
                            </div>
                            {this.channel ? (
                                <div className="chat">
                                    <h3>Messages</h3>
                                    <p>Logged in as {this.props.username}</p>
                                    <ul className="messages">
                                        {this.state.messages.map(
                                            (message: any) => (
                                                <li
                                                    key={message.sid}
                                                    ref={(li) => {
                                                        if (li) {
                                                            li.scrollIntoView();
                                                        }
                                                    }}
                                                >
                                                    <b>{message.author}:</b>{" "}
                                                    {message.body}
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                    <form
                                        onSubmit={(event) => {
                                            event.preventDefault();
                                            const message = this.state
                                                .newMessage;
                                            this.setState({ newMessage: "" });
                                            this.channel.sendMessage(message);
                                        }}
                                    >
                                        <label htmlFor="message">
                                            Message:{" "}
                                        </label>
                                        <input
                                            type="text"
                                            name="message"
                                            id="message"
                                            onChange={(event) => {
                                                this.setState({
                                                    newMessage:
                                                        event.target.value,
                                                });
                                            }}
                                            value={this.state.newMessage}
                                        />
                                        <button name="send">Send</button>
                                    </form>
                                    <br />
                                    <div>
                                        <b>Online</b>
                                        {this.state.onlineMembers.map(
                                            (member, i) => (
                                                <li key={i}>{member}</li>
                                            ),
                                        )}
                                        <b>Offline</b>
                                        {this.state.offlineMembers.map(
                                            (member, i) => (
                                                <li key={i}>{member}</li>
                                            ),
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <h1 className="noChannelJoined">
                                    Join a channel
                                </h1>
                            )}
                        </div>
                    )}
                </div>
                <div>
                    {this.chatClient === undefined ||
                    (this.props.role !== "admin" &&
                        this.props.role !== "employer") ? null : (
                        <div className="admin">
                            <form
                                onSubmit={async (event) => {
                                    event.preventDefault();
                                    try {
                                        const channel = await this.chatClient.createChannel(
                                            {
                                                uniqueName: this.state
                                                    .newChannel,
                                            },
                                        );
                                        channel.add(this.props.username);
                                        // Adding the coach alex to the channel
                                        if (this.props.username !== "alex") {
                                            channel.add("alex");
                                        }
                                    } catch (error) {
                                        if (error.code === 50307) {
                                            if (this.channel) {
                                                this.channel.removeListener(
                                                    "messageAdded",
                                                    this.messageAdded,
                                                );
                                            }

                                            const channel = await this.chatClient.getChannelByUniqueName(
                                                this.state.newChannel,
                                            );

                                            this.channel = channel;
                                            sessionStorage.setItem(
                                                "loggedChannel",
                                                channel.uniqueName,
                                            );

                                            const messages = await this.channel.getMessages();
                                            this.messagesLoaded(messages);
                                            this.channel.on(
                                                "messageAdded",
                                                this.messageAdded,
                                            );

                                            const members = await this.channel.getMembers();
                                            this.memberAdded(members);
                                        }
                                    }
                                    this.setState({ newChannel: "" });
                                }}
                            >
                                <input
                                    type="text"
                                    name="newchannel"
                                    id="newchannel"
                                    onChange={(event) => {
                                        this.setState({
                                            newChannel: event.target.value,
                                        });
                                    }}
                                    value={this.state.newChannel}
                                />
                                <button name="create">Create channel</button>
                            </form>
                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    if (this.channel) {
                                        this.channel.add(this.state.inviteUser);
                                    }
                                    this.setState({ inviteUser: "" });
                                }}
                            >
                                <input
                                    type="text"
                                    name="inviteuser"
                                    id="inviteuser"
                                    onChange={(event) => {
                                        this.setState({
                                            inviteUser: event.target.value,
                                        });
                                    }}
                                    value={this.state.inviteUser}
                                />
                                <button>Add user</button>
                            </form>
                        </div>
                    )}
                </div>
            </main>
        );
    }
}
