import * as React from "react";
import Chat from "twilio-chat";

import { NameBox } from "./NameBox";

export class ChatApp extends React.Component<
    any,
    {
        channels: string[];
        inviteUser: string;
        messages: string[];
        name: string;
        newChannel: string;
        newMessage: string;
        offlineMembers: string[];
        onlineMembers: string[];
        token: string;
    }
> {
    public chatClient: any;
    public channel: any;
    public name: string;
    public loggedIn: boolean;
    constructor(props: any) {
        super(props);
        this.state = {
            channels: [],
            inviteUser: "",
            messages: [],
            name: "",
            newChannel: "",
            newMessage: "",
            offlineMembers: [],
            onlineMembers: [],
            token: "",
        };
    }

    public componentDidMount() {
        this.getToken();
    }

    public getToken = async () => {
        this.loggedIn = false;
        this.name = sessionStorage.getItem("name") || "";
        if (this.name !== "" && this.name !== null) {
            this.loggedIn = true;
            const response = await fetch(`/token/${this.name}`, {
                method: "POST",
            });
            const data = await response.json();
            this.setState({ token: data.token }, this.initChat);
        }
    }

    public initChat = async () => {
        const client = await Chat.create(this.state.token);
        this.chatClient = client;
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
            <div>
                <style>{`
                    .chat {
                        position:relative;
                        top: -120px;
                        height: 350px;
                        width: 600px;
                    }
                    .channels {
                        list-style-type: none;
                        position: relative;
                        top: 40px;
                        left: 650px;
                    }
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
                    {this.loggedIn ? (
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
                                <br />
                                <form
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        this.setState({
                                            channels: [],
                                            inviteUser: "",
                                            messages: [],
                                            name: "",
                                            newChannel: "",
                                            newMessage: "",
                                            offlineMembers: [],
                                            onlineMembers: [],
                                            token: "",
                                        });
                                        sessionStorage.removeItem("name");
                                        sessionStorage.removeItem(
                                            "loggedChannel",
                                        );
                                        this.loggedIn = false;
                                        this.chatClient.shutdown();
                                        this.channel = null;
                                    }}
                                >
                                    <button name="logout">Log out</button>
                                </form>
                            </div>
                            {this.channel ? (
                                <div className="chat">
                                    <h3>Messages</h3>
                                    <p>Logged in as {this.name}</p>
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
                                        <button>Send</button>
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
                    ) : (
                        <div>
                            <NameBox
                                name={this.state.name}
                                onNameChanged={(event: any) => {
                                    this.setState({ name: event.target.value });
                                }}
                                logIn={(event: any) => {
                                    event.preventDefault();
                                    if (this.state.name !== "") {
                                        sessionStorage.setItem(
                                            "name",
                                            this.state.name,
                                        );
                                        this.loggedIn = true;
                                        this.getToken();
                                    }
                                }}
                            />
                        </div>
                    )}
                </div>
                <div>
                    {this.loggedIn &&
                    (this.name === "business" || this.name === "coach") ? (
                        <div className="admin">
                            <form
                                onSubmit={async (event) => {
                                    event.preventDefault();
                                    const channel = this.chatClient.createChannel(
                                        {
                                            uniqueName: this.state.newChannel,
                                        },
                                    );
                                    channel.add(this.name);
                                    channel.add("coach");
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
                                <button>Create channel</button>
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
                    ) : null}
                </div>
            </div>
        );
    }
}
