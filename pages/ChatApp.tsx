import * as React from "react";
import Chat from "twilio-chat";

import { NameBox } from "./NameBox";

export class ChatApp extends React.Component<any, any> {
    chatClient: any;
    loggedChannel: string;
    channel: any;
    name: string | null;
    loggedIn: boolean;
    constructor(props: any) {
        super(props);
        const name = "";
        this.state = {
            name,
            token: "",
            channel: "",
            channels: [],
            chatReady: false,
            inviteUser: "",
            messages: [],
            newMessage: "",
            newChannel: "",
        };
        this.name = "";
    }

    componentDidMount() {
        this.getToken();
    }

    onNameChanged = (event: any) => {
        this.setState({ name: event.target.value });
    };

    logIn = (event: any) => {
        event.preventDefault();
        if (this.state.name !== "") {
            sessionStorage.setItem("name", this.state.name);
            this.loggedIn = true;
            this.getToken();
        }
    };

    logOut = (event: any) => {
        event.preventDefault();
        this.setState({
            name: "",
            token: "",
            channel: "",
            channels: [],
            inviteUser: "",
            chatReady: false,
            messages: [],
            newMessage: "",
            newChannel: "",
        });
        sessionStorage.removeItem("name");
        this.loggedIn = false;
        this.chatClient.shutdown();
        this.channel = null;
    };

    getToken = () => {
        this.loggedIn = false;
        this.name = sessionStorage.getItem("name");
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
    };

    initChat = () => {
        Chat.create(this.state.token)
            .then((client: any) => {
                return (this.chatClient = client);
            })
            .then((client: any) => {
                client.on("channelAdded", this.channelAdded);
            });
    };

    channelAdded = (channel: any) => {
        this.setState((prevState: any, props: any) => ({
            channels: [...prevState.channels, channel.uniqueName],
        }));
    };

    channelList = (paginator: any) => {
        var i;
        var channel = [];

        for (i = 0; i < paginator.items.length; i++) {
            channel[i] = paginator.items[i].uniqueName;
        }
        this.setState({ channels: channel });
    };

    onChannelChanged = (event: any) => {
        this.setState({ newChannel: event.target.value });
    };

    onInviteChanged = (event: any) => {
        this.setState({ inviteUser: event.target.value });
    };

    messagesLoaded = (messagePage: any) => {
        this.setState({ messages: messagePage.items });
    };

    messageAdded = (message: string) => {
        this.setState((prevState: any, props: any) => ({
            messages: [...prevState.messages, message],
        }));
    };

    onMessageChanged = (event: any) => {
        this.setState({ newMessage: event.target.value });
    };

    sendMessage = (event: any) => {
        event.preventDefault();
        const message = this.state.newMessage;
        this.setState({ newMessage: "" });
        this.channel.sendMessage(message);
    };

    newMessageAdded = (li: any) => {
        if (li) {
            li.scrollIntoView();
        }
    };

    createChannel = (event: any) => {
        event.preventDefault();
        console.log(this.state.newChannel);
        this.chatClient
            .createChannel({ uniqueName: this.state.newChannel })
            .then((channel: any) => {
                channel.add(this.name);
                channel.add("coach");
            });
        this.setState({ newChannel: "" });
    };

    deleteChannel = (event: any) => {
        event.preventDefault();
        this.chatClient
            .getChannelByUniqueName(this.state.newChannel)
            .then((channel: any) => {
                channel.delete();
            });
        this.setState({ newChannel: "" });
    };

    joinChannel = (event: any) => {
        if (this.channel) {
            this.channel.removeListener("messageAdded", this.messageAdded);
        }
        event.preventDefault();
        this.chatClient
            .getChannelByUniqueName(this.state.newChannel)
            .then((channel: any) => {
                this.channel = channel;
            })
            .then(() => {
                this.channel.getMessages().then(this.messagesLoaded);
                this.channel.on("messageAdded", this.messageAdded);
            });
        this.setState({ newChannel: "" });
    };

    addMember = (event: any) => {
        event.preventDefault();
        if (this.channel) {
            this.channel.add(this.state.inviteUser);
        } else {
            console.log("You're not in a channel");
        }
        this.setState({ inviteUser: "" });
    };

    render() {
        const css = `
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
        `;
        var loginOrChat;
        var adminOrNot;
        const messages = this.state.messages.map((message: any) => {
            return (
                <li key={message.sid} ref={this.newMessageAdded}>
                    <b>{message.author}:</b> {message.body}
                </li>
            );
        });
        const channels = this.state.channels.map((channel: any) => {
            return (
                <button
                    type="submit"
                    onClick={this.onChannelChanged}
                    value={channel}
                >
                    {channel}
                </button>
            );
        });
        if (this.loggedIn && this.channel) {
            loginOrChat = (
                <div>
                    <h3>Messages</h3>
                    <p>Logged in as {this.name}</p>
                    <ul className="messages">{messages}</ul>
                    <form onSubmit={this.sendMessage}>
                        <label htmlFor="message">Message: </label>
                        <input
                            type="text"
                            name="message"
                            id="message"
                            onChange={this.onMessageChanged}
                            value={this.state.newMessage}
                        />
                        <button>Send</button>
                    </form>
                    <br />
                    <div>
                        <label>Join a channel: </label>
                        <form onSubmit={this.joinChannel}>{channels}</form>
                        <br />
                        <form onSubmit={this.logOut}>
                            <button>Log out</button>
                        </form>
                    </div>
                </div>
            );
        } else if (this.loggedIn) {
            loginOrChat = (
                <div>
                    <label>Join a channel: </label>
                    <form onSubmit={this.joinChannel}>{channels}</form>
                    <br />
                    <form onSubmit={this.logOut}>
                        <button>Log out</button>
                    </form>
                </div>
            );
        } else {
            loginOrChat = (
                <div>
                    <NameBox
                        name={this.state.name}
                        onNameChanged={this.onNameChanged}
                        logIn={this.logIn}
                    />
                </div>
            );
        }
        if (
            this.loggedIn &&
            (this.name === "business" || this.name === "coach")
        ) {
            adminOrNot = (
                <div>
                    <form onSubmit={this.createChannel}>
                        <input
                            type="text"
                            name="newchannel"
                            id="newchannel"
                            onChange={this.onChannelChanged}
                            value={this.state.newChannel}
                        />
                        <button>create</button>
                    </form>
                    <form onSubmit={this.addMember}>
                        <input
                            type="text"
                            name="inviteuser"
                            id="inviteuser"
                            onChange={this.onInviteChanged}
                            value={this.state.inviteUser}
                        />
                        <button>Add user</button>
                    </form>
                    <form onSubmit={this.deleteChannel}>
                        <input
                            type="text"
                            name="delchannel"
                            id="delchannel"
                            onChange={this.onChannelChanged}
                            value={this.state.delChannel}
                        />
                        <button>delete</button>
                    </form>
                </div>
            );
        } else {
            adminOrNot = null;
        }
        return (
            <div>
                <style>{css}</style>
                <div>{loginOrChat}</div>
                <div>{adminOrNot}</div>
            </div>
        );
    }
}

export default ChatApp;
