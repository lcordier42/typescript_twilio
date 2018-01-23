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

    public logIn = (event: any) => {
        event.preventDefault();
        if (this.state.name !== "") {
            sessionStorage.setItem("name", this.state.name);
            this.loggedIn = true;
            this.getToken();
        }
    }

    public logOut = (event: any) => {
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
        sessionStorage.removeItem("loggedChannel");
        this.loggedIn = false;
        this.chatClient.shutdown();
        this.channel = null;
    }

    public getToken = () => {
        this.loggedIn = false;
        this.name = sessionStorage.getItem("name") || "";
        if (this.name !== "" && this.name !== null) {
            this.loggedIn = true;
            fetch(`/token/${this.name}`, {
                method: "POST",
            })
                .then((response) => response.json())
                .then((data) => {
                    this.setState({ token: data.token }, this.initChat);
                });
        } else {
            this.loggedIn = false;
        }
    }

    public initChat = () => {
        Chat.create(this.state.token)
            .then((client: any) => {
                return (this.chatClient = client);
            })
            .then((client: any) => {
                client.on("channelAdded", (channel: any) => {
                    this.setState((prevState: any, props: any) => ({
                        channels: [...prevState.channels, channel.uniqueName],
                    }));
                });
                return client;
            })
            .then((client: any) => {
                const channelName =
                    sessionStorage.getItem("loggedChannel") || "";
                if (channelName !== "") {
                    client
                        .getChannelByUniqueName(channelName)
                        .then((channel: any) => {
                            this.channel = channel;
                        })
                        .then(() => {
                            this.channel
                                .getMessages()
                                .then(this.messagesLoaded);
                            this.channel.on("messageAdded", this.messageAdded);
                            this.channel
                                .getMembers()
                                .then(this.memberAdded.bind(this));
                        });
                }
            });
    }

    public messagesLoaded = (messagePage: any) => {
        this.setState({ messages: messagePage.items });
    }

    public messageAdded = (message: string) => {
        this.setState((prevState: any, props: any) => ({
            messages: [...prevState.messages, message],
        }));
    }

    public createChannel = (event: any) => {
        event.preventDefault();
        this.chatClient
            .createChannel({ uniqueName: this.state.newChannel })
            .then((channel: any) => {
                channel.add(this.name);
                channel.add("coach");
            });
        this.setState({ newChannel: "" });
    }

    public memberAdded = (members: string[]) => {
        this.setState({ onlineMembers: [] });
        this.setState({ offlineMembers: [] });
        members.map((member: any) => {
            member.getUser().then((user: any) => {
                if (user.online === true) {
                    this.setState((prevState: any, props: any) => ({
                        onlineMembers: [
                            ...prevState.onlineMembers,
                            member.identity,
                        ],
                    }));
                } else {
                    this.setState((prevState: any, props: any) => ({
                        offlineMembers: [
                            ...prevState.offlineMembers,
                            member.identity,
                        ],
                    }));
                }
            });
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
                                    onSubmit={(event: any) => {
                                        event.preventDefault();
                                        if (this.channel) {
                                            this.channel.removeListener(
                                                "messageAdded",
                                                this.messageAdded,
                                            );
                                        }
                                        this.chatClient
                                            .getChannelByUniqueName(
                                                this.state.newChannel,
                                            )
                                            .then((channel: any) => {
                                                this.channel = channel;
                                                sessionStorage.setItem(
                                                    "loggedChannel",
                                                    channel.uniqueName,
                                                );
                                            })
                                            .then(() => {
                                                this.channel
                                                    .getMessages()
                                                    .then(this.messagesLoaded);
                                                this.channel.on(
                                                    "messageAdded",
                                                    this.messageAdded,
                                                );
                                                this.channel
                                                    .getMembers()
                                                    .then(
                                                        this.memberAdded.bind(
                                                            this,
                                                        ),
                                                    );
                                            });
                                        this.setState({ newChannel: "" });
                                    }}
                                >
                                    {this.state.channels.map(
                                        (channel: any, i: number) => (
                                            <li key={i}>
                                                <button
                                                    type="submit"
                                                    onClick={(event: any) => {
                                                        this.setState({
                                                            newChannel:
                                                                event.target
                                                                    .value,
                                                        });
                                                    }}
                                                    value={channel}
                                                >
                                                    {channel}
                                                </button>
                                            </li>
                                        ),
                                    )}
                                </form>
                                <br />
                                <form onSubmit={this.logOut}>
                                    <button>Log out</button>
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
                                                    ref={(li: any) => {
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
                                        onSubmit={(event: any) => {
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
                                            onChange={(event: any) => {
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
                                            (member: any, i: number) => (
                                                <li key={i}>{member}</li>
                                            ),
                                        )}
                                        <b>Offline</b>
                                        {this.state.offlineMembers.map(
                                            (member: any, i: number) => (
                                                <li key={i}>{member}</li>
                                            ),
                                        )}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    ) : (
                        <div>
                            <NameBox
                                name={this.state.name}
                                onNameChanged={(event: any) => {
                                    this.setState({ name: event.target.value });
                                }}
                                logIn={this.logIn}
                            />
                        </div>
                    )}
                </div>
                <div>
                    {this.loggedIn &&
                    (this.name === "business" || this.name === "coach") ? (
                        <div className="admin">
                            <form onSubmit={this.createChannel}>
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
                                onSubmit={(event: any) => {
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
                                    onChange={(event: any) => {
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
