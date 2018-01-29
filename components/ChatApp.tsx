import * as React from "react";
import Chat from "twilio-chat";

import admins from "../lib/admins";

const ERROR_CODE__CHANNEL_ALREADY_EXISTS = 50307; // https://www.twilio.com/docs/api/errors/50307

export class ChatApp extends React.Component<
    {
        candidateName: string | undefined;
        role: string;
        token: string;
        username: string;
    },
    {
        channels: string[];
        inviteUser: string;
        joinChannel: string;
        messages: string[];
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
            joinChannel: "",
            messages: [],
            newMessage: "",
            offlineMembers: [],
            onlineMembers: [],
            username: "",
        };
    }

    public componentWillUnmount() {
        if (this.chatClient !== undefined) {
            if (this.channel !== undefined) {
                this.channel.removeListener("messageAdded", this.messageAdded);
            }
            this.chatClient.shutdown();
        }
    }

    public messageAdded = (message: string) => {
        this.setState((prevState, props) => ({
            messages: [...prevState.messages, message],
        }));
    };

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
                                        if (this.chatClient) {
                                            const channel = await this.chatClient.getChannelByUniqueName(
                                                this.state.joinChannel,
                                            );
                                            this.channel = channel;
                                        }

                                        const messagePage = await this.channel.getMessages();
                                        this.setState({
                                            messages: messagePage.items,
                                        });
                                        this.channel.on(
                                            "messageAdded",
                                            this.messageAdded,
                                        );

                                        const members = await this.channel.getMembers();
                                        this.setState({ onlineMembers: [] });
                                        this.setState({ offlineMembers: [] });
                                        members.map(async (member: any) => {
                                            const user = await member.getUser();
                                            if (user.online === true) {
                                                this.setState(
                                                    (prevState, props) => ({
                                                        onlineMembers: [
                                                            ...prevState.onlineMembers,
                                                            member.identity,
                                                        ],
                                                    }),
                                                );
                                            } else {
                                                this.setState(
                                                    (prevState, props) => ({
                                                        offlineMembers: [
                                                            ...prevState.offlineMembers,
                                                            member.identity,
                                                        ],
                                                    }),
                                                );
                                            }
                                        });
                                    }}
                                >
                                    {this.state.channels.map((channel, i) => (
                                        <li key={i}>
                                            <button
                                                type="submit"
                                                name={channel}
                                                onClick={(event: any) => {
                                                    this.setState({
                                                        joinChannel:
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
                                    if (this.channel) {
                                        await this.channel.add(
                                            this.state.inviteUser,
                                        );
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

    public async componentDidMount() {
        this.chatClient = await Chat.create(this.props.token);
        this.chatClient.on("channelAdded", (channel: any) => {
            this.setState((prevState, props) => ({
                channels: [...prevState.channels, channel.uniqueName],
            }));
        });
        if (this.props.candidateName !== undefined) {
            const channelName =
                this.props.username + " - " + this.props.candidateName;
            // Si un candidate a été invité
            const previousChannel = this.channel || undefined;
            // false === channel non existant, true === channel déjà crée
            let created = false;
            // @ts-ignore
            const paginator = await this.chatClient.getSubscribedChannels();
            let i;
            for (i = 0; i < paginator.items.length; i++) {
                const channel = paginator.items[i];
                if (channel.uniqueName === channelName) {
                    created = true;
                }
            }

            if (created === false) {
                this.channel = await this.chatClient.createChannel({
                    uniqueName: channelName,
                });
                await this.channel.add(this.props.candidateName);
                await this.channel.add(this.props.username);
                await Promise.all(admins.map((a) => this.channel.add(a)));
            } else {
                // si le canal existe je récupère ses informations afin de le rejoindre
                // mettre l'id de l'un et de l'autre avec virgule entre les deux
                this.channel = await this.chatClient.getChannelByUniqueName(
                    channelName,
                );
            }
            const messagePage = await this.channel.getMessages();
            this.setState({ messages: messagePage.items });
            await this.channel.on("messageAdded", this.messageAdded);

            const members = await this.channel.getMembers(); // penser a utiliser un event
            this.setState({ onlineMembers: [] });
            this.setState({ offlineMembers: [] });
            for (const member of members) {
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
            }
        }
    }
}
