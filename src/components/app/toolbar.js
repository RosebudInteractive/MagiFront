import React, { Component } from 'react'
import User from "./user";
import LogoutButton from "./logout-button";

export default class Toolbar extends Component {
    render() {
        return <div className="right-top top-bar-size">
            <div className="right__toolbar">
                <User/>
                <LogoutButton/>
            </div>
        </div>
    }
}