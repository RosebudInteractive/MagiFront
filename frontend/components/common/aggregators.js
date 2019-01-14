import React from 'react';
import PropTypes from "prop-types";
import {Link} from 'react-router-dom';

const hosts = {
    'www.litres.ru': {image: '/assets/images/lit-res.png', order: 1},
    'ru.bookmate.com': {image: '/assets/images/book-mate.png', order: 2},
    'www.storytel.com': {image: '/assets/images/storytel.png', order: 3},
    'zvukislov.ru': {image: '/assets/images/word-sounds.png', order: 4},
}

export default class Aggregators extends React.Component {

    static propTypes = {
        extLinks: PropTypes.object,
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
            let _orderA = hosts[a] ? hosts[a].order : 0,
                _orderB = hosts[b] ? hosts[b].order : 0;

            return _orderA - _orderB
        })

        return _links.map((link) => {
            return <Item host={link} link={extLinks[link]}/>
        });
    }

    render() {
        return this.props.extLinks ?
            <ul className="aggregator-list">
                {this._getItems()}
            </ul>
            :
            null
    }

}

class Item extends React.Component {
    static propTypes = {
        host: PropTypes.string,
        link: PropTypes.string,
    }

    render() {
        return <li className="aggregator-list__item">
            <Link to={this.props.link} target="_blank">
                <img src={this._getImage()}/>
            </Link>
        </li>

    }

    _getImage() {
        if (hosts.hasOwnProperty(this.props.host)) {
            return hosts[this.props.host].image
        } else {
            return null
        }
    }
}