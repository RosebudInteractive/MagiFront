import React from "react";
import PropTypes from "prop-types";
import {Link} from "react-router-dom";
import {HOSTS} from "./consts";

export default class Item extends React.Component {

    static propTypes = {
        host: PropTypes.string,
        link: PropTypes.string,
    }

    render() {
        return <li id={this._getId()}>
            <a href={this.props.link} target="_blank">
                <span className="other-sources__icon">
                    <img src={this._getImage()} width={this._getWidth()} height={this._getHeight()}
                         alt={this._getTitle()}/>
                </span>
                <span className="other-sources__name">{this._getTitle()}</span>
            </a>
        </li>

    }

    _getImage() {
        if (HOSTS.hasOwnProperty(this.props.host)) {
            return HOSTS[this.props.host].image
        } else {
            return null
        }
    }

    _getId() {
        if (HOSTS.hasOwnProperty(this.props.host)) {
            return HOSTS[this.props.host].id
        } else {
            return null
        }
    }

    _getTitle() {
        if (HOSTS.hasOwnProperty(this.props.host)) {
            return HOSTS[this.props.host].title
        } else {
            return null
        }
    }

    _getWidth() {
        if (HOSTS.hasOwnProperty(this.props.host)) {
            return HOSTS[this.props.host].width
        } else {
            return null
        }
    }

    _getHeight() {
        if (HOSTS.hasOwnProperty(this.props.host)) {
            return HOSTS[this.props.host].height
        } else {
            return null
        }
    }
}