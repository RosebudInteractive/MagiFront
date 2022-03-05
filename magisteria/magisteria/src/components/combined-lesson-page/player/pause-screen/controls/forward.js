import React from 'react';
import PropTypes from "prop-types";

export default class Forward extends React.Component {

    static propTypes = {
        onClick: PropTypes.func,
    }

    render() {
        const _forwards = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#forwards"/>'

        return <button type="button" className="lecture-frame__play-control _backwards"
                       onClick={::this._onClick}>
            <span className="label">+10</span>
            <svg className="icon" width="32" height="21" dangerouslySetInnerHTML={{__html: _forwards}}/>
        </button>
    }

    _onClick() {
        if (this.props.onClick) { this.props.onClick() }
    }
}