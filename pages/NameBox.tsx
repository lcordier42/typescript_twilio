import * as React from "react";

type NameBoxProps = {
    name: string;
    onNameChanged: any;
    logIn: any;
};

export class NameBox extends React.Component<NameBoxProps> {
    render() {
        const name = this.props.name;
        const onNameChanged = this.props.onNameChanged;
        const logIn = this.props.logIn;
        return (
            <div>
                <form onSubmit={logIn}>
                    <label htmlFor="name">Name: </label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        onChange={onNameChanged}
                        value={name}
                    />
                    <br />
                    <button type="submit">Log in</button>
                </form>
            </div>
        );
    }
}

export default NameBox;
