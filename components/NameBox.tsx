import * as React from "react";

interface INameBoxProps {
    name: string;
    onNameChanged: any;
    logIn: any;
}

export class NameBox extends React.Component<INameBoxProps> {
    public render() {
        const name = this.props.name;
        const onNameChanged = this.props.onNameChanged;
        const logIn = this.props.logIn;
        return (
            <div>
                <form onSubmit={logIn}>
                <select
                        name="name"
                        id="name"
                        onChange={onNameChanged}
                        value={name}
                    >
                        <option value="guest">guest</option>
                        <option value="business">business</option>
                        <option value="candidat">candidat</option>
                        <option value="coach">coach</option>
                    </select>
                    <button type="submit">Log in</button>
                </form>
            </div>
        );
    }
}

export default NameBox;
