import * as React from "react";
import Chat from "twilio-chat";

import { NameBox } from "./NameBox";

export class ChatApp extends React.Component<any, any> {
    channelName: string;
    chatClient: any;
    channel: any;
    constructor(props: any) {
        super(props);
        const name = "";
        const loggedIn = name !== "";
        this.state = {
            name,
            loggedIn,
            token: "",
            channel: "",
            chatReady: false,
            messages: [],
            newMessage: "",
        };
        this.channelName = "general";
    }

    componentWillMount() {
        if (this.state.loggedIn) {
            this.getToken();
        }
    }

    onNameChanged = (event: any) => {
        this.setState({ name: event.target.value });
    };

    logIn = (event: any) => {
        event.preventDefault();
        if (this.state.name !== "") {
            this.setState({ loggedIn: true }, this.getToken);
        }
    };

    logOut = (event: any) => {
        event.preventDefault();
        this.setState({
            name: "",
            status: "",
            loggedIn: false,
            channel: "",
            token: "",
            chatReady: false,
            messages: [],
            newMessage: "",
        });
        this.channelName = "general";
        this.chatClient.shutdown();
        this.channel = null;
    };

    getToken = () => {
        console.log("test");
        fetch(`/token/${this.state.name}`, {
            method: "POST",
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                this.setState({ token: data.token }, this.initChat);
            });
    };

    initChat = () => {
        Chat.create(this.state.token)
            .then((client) => {
                if (client) {
                    return (this.chatClient = client);
                }
            })
            .then((client) => {
                console.log(client);
                client
                    .getChannelByUniqueName(this.channelName)
                    .then((channel) => {
                        if (channel) {
                            return (this.channel = channel);
                        }
                    })
                    .then((channel) => {
                        this.channel = channel;
                        return this.channel.join();
                    })
                    .catch((error: any) => {
                        if (error.code === 50404) {
                            console.log("Oh bah mince");
                        }
                    })
                    .then(() => {
                        this.channel.getMessages().then(this.messagesLoaded);
                        this.channel.on("messageAdded", this.messageAdded);
                    });
            });
        console.log(this.chatClient);
        console.log(this.channel);
    };

    messagesLoaded = (messagePage: any) => {
        this.setState({ messages: messagePage.items });
    };

    messageAdded = (message: any) => {
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

    render() {
        var loginOrChat;

        const messages = this.state.messages.map((message: any) => {
            return (
                <li key={message.sid} ref={this.newMessageAdded}>
                    <b>{message.author}:</b> {message.body}
                </li>
            );
        });
        if (this.state.loggedIn) {
            loginOrChat = (
                <div>
                    <h3>Messages</h3>
                    <p>Logged in as {this.state.name}</p>
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
        return <div>{loginOrChat}</div>;
    }
}

export default ChatApp;
