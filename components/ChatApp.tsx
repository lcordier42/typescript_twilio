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

    public messageAdded = async (message: any) => {
        this.setState((prevState) => ({
            messages: [...prevState.messages, message],
        }));
        if (message.index > message.channel.lastConsumedMessageIndex) {
            // % 30 is here because message index can be > 30 and when i call the method "getMessages"
            // I only get 30 (it's configurable)
            message.channel.updateLastConsumedMessageIndex(message.index % 30);
        }
    }

    // factored for better lisibility for now, but I'll duplicate later, called 2 times for now
    public updateChannels = async () => {
        if (this.chatClient) {
            this.setState({ channels: [] });
            const channels = await this.chatClient.getSubscribedChannels(
                undefined,
            );
            channels.items.map(async (channel) => {
                const messages = await channel.getMessages();
                const index = messages.items.length;

                this.setState((prevState) => ({
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
            });
        }
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
                                        // each time I join a channel, i set the lastConsumedMessage at the index
                                        // of last message in the channel
                                        if (
                                            messagePage.items[
                                                messagePage.items.length - 1
                                            ] !== undefined &&
                                            messagePage.items[
                                                messagePage.items.length - 1
                                            ].index >
                                                messagePage.items[
                                                    messagePage.items.length - 1
                                                ].channel
                                                    .lastConsumedMessageIndex
                                        ) {
                                            messagePage.items[
                                                messagePage.items.length - 1
                                            ].channel.updateLastConsumedMessageIndex(
                                                messagePage.items[
                                                    messagePage.items.length - 1
                                                ].index % 30,
                                            );
                                        }
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
                                                this.setState((prevState) => ({
                                                    onlineMembers: [
                                                        ...prevState.onlineMembers,
                                                        member.identity,
                                                    ],
                                                }));
                                            } else {
                                                this.setState((prevState) => ({
                                                    offlineMembers: [
                                                        ...prevState.offlineMembers,
                                                        member.identity,
                                                    ],
                                                }));
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
                                        .map((channel) => (
                                            <li key={channel.channel.sid}>
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
                                                                    .name,
                                                        });
                                                    }}
                                                >
                                                    {channel.channel.uniqueName}
                                                </button>
                                                <p>
                                                    {/*Here I add "new" or nothing before the last message send*/}
                                                    {channel.messages &&
                                                    channel.messages.index %
                                                        30 >
                                                        channel.messages.channel
                                                            .lastConsumedMessageIndex ? (
                                                        <b>new </b>
                                                    ) : null}
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

        this.updateChannels();
        // I have a problem here when I create a new channel, rendering is done before
        // this.state.channels is filled, so i've got an error, i'll correct it asap
        this.chatClient.on("channelAdded", async (newChannel) => {
            if (this.chatClient !== undefined) {
                const channels = await this.chatClient.getSubscribedChannels(
                    undefined,
                );
                this.state.channels.map(async (channel) => {
                    if (newChannel.uniqueName !== channel.uniqueName) {
                        const messages = await newChannel.getMessages();
                        const index = messages.items.length;

                        this.setState((prevState) => ({
                            channels: [
                                ...prevState.channels,
                                {
                                    messages:
                                        messages.items[index - 1] !== undefined
                                            ? messages.items[index - 1]
                                            : undefined,
                                    newChannel,
                                },
                            ],
                        }));
                    }
                });
            }
        });
        // Each time someone send a message on a subscribed channel, i update
        // channels to get the lasts messages
        this.chatClient.on("messageAdded", this.updateChannels);
        if (this.props.candidate !== undefined) {
            const channelName = [
                this.props.user.username,
                this.props.candidate.username,
            ].toString();
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
            if (
                messagePage.items[messagePage.items.length - 1] !== undefined &&
                messagePage.items[messagePage.items.length - 1].index >
                    messagePage.items[messagePage.items.length - 1].channel
                        .lastConsumedMessageIndex
            ) {
                messagePage.items[
                    messagePage.items.length - 1
                ].channel.updateLastConsumedMessageIndex(
                    messagePage.items[messagePage.items.length - 1].index % 30,
                );
            }
            await this.channel.on("messageAdded", this.messageAdded);

            const members = await this.channel.getMembers(); // penser a utiliser un event
            this.setState({ onlineMembers: [] });
            this.setState({ offlineMembers: [] });
            for (const member of members) {
                const user = await member.getUser();
                if (user.online === true) {
                    this.setState((prevState) => ({
                        onlineMembers: [
                            ...prevState.onlineMembers,
                            member.identity,
                        ],
                    }));
                } else {
                    this.setState((prevState) => ({
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
