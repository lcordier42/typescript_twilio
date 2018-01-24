import * as React from "react";

export const NameBox: React.SFC<{
    name: string;
    onNameChanged: any;
    logIn: any;
}> = ({ name, onNameChanged, logIn }) => (
    <div className="NameBox">
        <form onSubmit={logIn}>
            <select name="name" id="name" onChange={onNameChanged} value={name}>
                <option value="guest">guest</option>
                <option value="business">business</option>
                <option value="candidat">candidat</option>
                <option value="coach">coach</option>
            </select>
            <button name="login" type="submit">
                Log in
            </button>
        </form>
    </div>
);
