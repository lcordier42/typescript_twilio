import * as React from "react";
import Chat from "twilio-chat";

import { admins } from "../lib/admins";
import { Channels } from "./Channels";
import { LastMessages } from "./LastMessages";
import { Messages } from "./Messages";

export class ChatApp extends React.Component<
    {
        candidate: { id: string; username: string } | undefined;
        role: string | undefined;
        token: string;
        user: { id: string; username: string };
    },
    {
        channels: any[];
        joinChannel: any | undefined;
        lastMessages: any[];
    }
> {
    private channel: any;
    private chatClient: Chat | undefined;

    constructor() {
        // @ts-ignore
        super(...arguments);
        this.state = {
            channels: [],
            joinChannel: undefined,
            lastMessages: [],
        };
    }

    public componentWillUnmount() {
        if (this.chatClient !== undefined) {
            this.chatClient.shutdown();
        }
        document.cookie = "";
    }

    public getLastMessages = async () => {
        if (this.chatClient !== undefined) {
            const channels = await this.chatClient.getSubscribedChannels(
                undefined,
            );
            const lastMessages = new Array();
            const channelsSorted = channels.items.sort(
                (a, b) => b.dateCreated - a.dateCreated,
            );
            for (const channel of channelsSorted) {
                const messages = await channel.getMessages();
                lastMessages.push(messages.items.slice(-1)[0]);
            }
            this.setState({ lastMessages });
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
                    .channels {
                        float: left;
                        list-style-type: none;
                        width: 180px;
                    }

                    .channels li {
                        margin-bottom: 0.25em;
                    }

                    .channels_blocks {
                        width: 600px;
                        margin-bottom: 50px;
                    }

                    .last_messages {
                        list-style-type: none;
                        width: 700px;
                    }

                    .last_messages li {
                        margin-bottom: 0.44em;
                    }

                    .messages {
                        list-style-type: none;
                        height: 350px;
                        overflow-y: scroll;
                        padding: 0;
                    }

                    .messages li {
                        background-color: #e8e8e8;
                        margin-bottom: 0.5em;
                        padding: 1em 0.5em;
                    }

                `}</style>
                <div>
                    {this.chatClient === undefined ? (
                        <div>
                            <h1>Chat client is undefined</h1>
                        </div>
                    ) : (
                        <div>
                            <div className="channels_blocks">
                                <Channels
                                    channels={this.state.channels}
                                    joinChannel={async (event: any) => {
                                        event.preventDefault();
                                        if (this.chatClient !== undefined) {
                                            this.setState({
                                                joinChannel: await this.chatClient.getChannelByUniqueName(
                                                    event.target.name,
                                                ),
                                            });
                                        }
                                    }}
                                />
                                <LastMessages
                                    lastMessages={this.state.lastMessages}
                                />
                            </div>
                            {this.state.joinChannel !== undefined ? (
                                <div>
                                    {/* New component messages */}
                                    <Messages
                                        channel={this.state.joinChannel}
                                        user={this.props.user}
                                    />
                                </div>
                            ) : (
                                <h1 className="noChannelJoined">
                                    Join a channel
                                </h1>
                            )}
                        </div>
                    )}
                </div>
            </main>
        );
    }

    public async componentDidMount() {
        this.chatClient = await Chat.create(this.props.token);
        this.getLastMessages();
        this.chatClient.on("channelAdded", (channel: any) => {
            this.setState((prevState) => ({
                channels: [...prevState.channels, channel],
            }));
        });
        this.chatClient.on("messageAdded", this.getLastMessages);

        const savedChannel = document.cookie;
        if (this.props.candidate !== undefined) {
            const channelName = [
                this.props.user.username,
                this.props.candidate.username,
            ].toString();
            // Si un candidate a été invité
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
            this.setState({ joinChannel: this.channel });
        } else if (savedChannel !== "") {
            this.channel = await this.chatClient.getChannelByUniqueName(
                savedChannel,
            );
            this.setState({ joinChannel: this.channel });
        }
    }
}
