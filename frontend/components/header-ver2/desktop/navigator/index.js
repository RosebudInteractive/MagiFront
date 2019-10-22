import React from "react";
import UserNavigator from "./user-navigator";
import FilterBlock from "./filter-block";
import './navigator.sass'

export default class Navigator extends React.Component {

    render() {
        return <nav className="navigation">
                <ul className="header-menu">
                    <FilterBlock/>
                    <UserNavigator/>
                </ul>
            </nav>
    }
}
