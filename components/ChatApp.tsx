import * as React from "react";
import Chat from "twilio-chat";

import { admins } from "../lib/admins";

const ERROR_CODE__CHANNEL_ALREADY_EXISTS = 50307; // https://www.twilio.com/docs/api/errors/50307

export class ChatApp extends React.Component<
    {
        candidate: { id: string; username: string } | undefined;
        role: string;
        token: string;
        user: { id: string; username: string };
    },
    {
        channelState: any[];
        channels: any[];
        inviteUser: string;
        joinChannel: string;
        messages: string[];
        newMessage: string;
        offlineMembers: string[];
        onlineMembers: string[];
    }
> {
    private channel: any;
    private chatClient: Chat | undefined;

    constructor() {
        // @ts-ignore
        super(...arguments);
        this.state = {
            channelState: [],
            channels: [],
            inviteUser: "",
            joinChannel: "",
            messages: [],
            newMessage: "",
            offlineMembers: [],
            onlineMembers: [],
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

    public messageAdded = async (message: string) => {
        this.setState((prevState, props) => ({
            messages: [...prevState.messages, message],
        }));
        const index = await this.channel.setAllMessagesConsumed();
    }

    public render() {
        return (
            <main>
                <header>
                    <h2>Role: {this.props.role}</h2>
                    <h3>Username: {this.props.user.username}</h3>
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
                                    {this.state.channels
                                        .sort(
                                            (a, b) =>
                                                b.channel.dateCreated -
                                                a.channel.dateCreated,
                                        )
                                        .map((channel, i) => (
                                            <li key={i}>
                                                <button
                                                    type="submit"
                                                    name={
                                                        channel.channel
                                                            .uniqueName
                                                    }
                                                    onClick={(event: any) => {
                                                        this.setState({
                                                            joinChannel:
                                                                event.target
                                                                    .value,
                                                        });
                                                    }}
                                                    value={
                                                        channel.channel
                                                            .uniqueName
                                                    }
                                                >
                                                    {channel.channel.uniqueName}
                                                </button>
                                                <p>
                                                    last message:
                                                    {channel.messages !==
                                                    undefined
                                                        ? channel.messages.body
                                                        : "empty conversation"}
                                                </p>
                                            </li>
                                        ))}
                                </form>
                            </div>
                            {this.channel ? (
                                <div className="chat">
                                    <h3>Messages</h3>
                                    <p>
                                        Logged in as {this.props.user.username}
                                    </p>
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

        this.chatClient.on("channelAdded", async (channel) => {
            const messages = await channel.getMessages();
            const index = messages.items.length;

            this.setState((prevState, props) => ({
                channels: [
                    ...prevState.channels,
                    {
                        channel,
                        messages:
                            messages.items[index - 1] !== undefined
                                ? messages.items[index - 1]
                                : undefined,
                    },
                ],
            }));
            this.setState({ channelState: this.state.channels });
        });
        this.chatClient.on("messageAdded", () => {
            this.setState({ channels: [] });
            this.state.channelState.map(async (channel) => {
                const messages = await channel.channel.getMessages();
                const index = messages.items.length;

                this.setState((prevState, props) => ({
                    channels: [
                        ...prevState.channels,
                        {
                            channel: channel.channel,
                            messages:
                                messages.items[index - 1] !== undefined
                                    ? messages.items[index - 1]
                                    : undefined,
                        },
                    ],
                }));
            });
        });
        if (this.props.candidate !== undefined) {
            const channelName = [
                this.props.user.username,
                this.props.candidate.username,
            ].toString();
            // Si un candidate a été invité
            const previousChannel = this.channel || undefined;
            // false === channel non existant, true === channel déjà crée
            let created = false;
            const paginator = await this.chatClient.getSubscribedChannels(
                undefined,
            );
            created = paginator.items.some((channel: any) => {
                return channel.uniqueName === channelName;
            });
            if (created === false) {
                this.channel = await this.chatClient.createChannel({
                    uniqueName: channelName,
                });
                await Promise.all([
                    this.channel.add(this.props.candidate.username),
                    this.channel.add(this.props.user.username),
                    admins.map((a) => this.channel.add(a.username)),
                ]);
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
