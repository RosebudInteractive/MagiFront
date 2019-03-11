import React from 'react';
import PropTypes from "prop-types";
import Item from './item'
import {HOSTS} from "./consts";

export default class Aggregators extends React.Component {

    static propTypes = {
        extLinks: PropTypes.object,
        title: PropTypes.string,
        titleClass: PropTypes.string,
    }

    constructor(props) {
        super(props)
    }

    _getItems() {
        let {extLinks} = this.props,
            _links = [];

        for (let host in extLinks) {
            if (extLinks.hasOwnProperty(host)) {
                _links.push(host)
            }
        }

        _links.sort((a, b) => {
            let _orderA = HOSTS[a] ? HOSTS[a].order : 0,
                _orderB = HOSTS[b] ? HOSTS[b].order : 0;

            return _orderA - _orderB
        })

        return _links.map((link) => {
            return <Item host={link} link={extLinks[link]}/>
        });
    }

    render() {
        let {extLinks, title, titleClass} = this.props

        return extLinks ?
            <div className="other-sources">
                <h3 className={titleClass}>{title}</h3>
                <ul>{this._getItems()}</ul>
            </div>
            :
            null
    }
}