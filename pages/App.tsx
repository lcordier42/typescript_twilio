import * as React from "react";

import { ChatApp } from "./ChatApp";

export class App extends React.Component {
    render() {
        return (
            <div>
                <header>
                    <h1>Twilio Programmable Chat!</h1>
                </header>
                <ChatApp />
            </div>
        );
    }
}

export default App;
