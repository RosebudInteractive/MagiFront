import React from "react";
import UserNavigator from "./user-navigator";
import FilterBlock from "./filter-block";
import './navigator.sass'
import PropTypes from "prop-types";
import SearchItem from "./search-item";

export default class Navigator extends React.Component {

    static propTypes = {
        isPhoneViewPort: PropTypes.bool,
    };

    render() {
        const {isPhoneViewPort} = this.props

        return <nav className="navigation">
                <ul className="header-menu">
                    {!isPhoneViewPort && <FilterBlock/>}
                    <UserNavigator isPhoneViewPort={isPhoneViewPort}/>
                    <SearchItem/>
                </ul>
            </nav>
    }
}
