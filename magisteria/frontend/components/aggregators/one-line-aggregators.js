import React from 'react';
import PropTypes from "prop-types";
import Item from './item'
import {HOSTS} from "./consts";

export default class Aggregators extends React.Component {

    static propTypes = {
        extLinks: PropTypes.object,
    }

    constructor(props) {
        super(props)

        // this._fFadeIn = function(e) {
        //     document.getElementById('gray-filter-anim-in').beginElement();
        // };
        //
        // this._fFadeOut = function(e) {
        //     document.getElementById('gray-filter-anim-out').beginElement();
        // };


    }

    componentDidMount() {
        // $('#litres-link').hover(this._fFadeIn, this._fFadeOut);
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
        return this.props.extLinks ?
            <ul className="aggregator-list other-sources">
                {this._getItems()}
            </ul>
            :
            null
    }

}

// class Item extends React.Component {
//
//     static propTypes = {
//         host: PropTypes.string,
//         link: PropTypes.string,
//     }
//
//     constructor(props) {
//         super(props)
//
//         this._fFadeIn = () => {
//             document.getElementById('gray-filter-anim-in-' + this._getOrder()).beginElement();
//         };
//
//         this._fFadeOut = () => {
//             document.getElementById('gray-filter-anim-out-' + this._getOrder()).beginElement();
//         };
//
//
//     }
//
//     componentDidMount() {
//         let _id = '#' + this._getId()
//         $(_id).hover(this._fFadeIn, this._fFadeOut);
//     }
//
//     render() {
//         const _style = {filter: 'url(#gray-filter-' + this._getOrder() + ')'}
//
//         return <li className="aggregator-list__item" id={this._getId()} >
//             <Link to={this.props.link} target="_blank" style={_style}>
//                 <svg width={this._getWidth()} height={this._getHeight()} dangerouslySetInnerHTML={{__html: this._getImage()}}/>
//             </Link>
//         </li>
//
//     }
//
//     _getImage() {
//         if (hosts.hasOwnProperty(this.props.host)) {
//             return hosts[this.props.host].svg
//         } else {
//             return null
//         }
//     }
//
//     _getId() {
//         if (hosts.hasOwnProperty(this.props.host)) {
//             return hosts[this.props.host].id
//         } else {
//             return null
//         }
//     }
//
//     _getOrder() {
//         if (hosts.hasOwnProperty(this.props.host)) {
//             return hosts[this.props.host].order
//         } else {
//             return null
//         }
//     }
//
//     _getWidth() {
//         if (hosts.hasOwnProperty(this.props.host)) {
//             return hosts[this.props.host].width
//         } else {
//             return null
//         }
//     }
//
//     _getHeight() {
//         if (hosts.hasOwnProperty(this.props.host)) {
//             return hosts[this.props.host].height
//         } else {
//             return null
//         }
//     }
// }