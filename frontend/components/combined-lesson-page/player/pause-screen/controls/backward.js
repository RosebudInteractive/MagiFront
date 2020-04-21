import React from 'react';
import PropTypes from "prop-types";

export default class Backward extends React.Component {

    static propTypes = {
        onClick: PropTypes.func,
    }

    render() {
        const _backwards = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#backward"/>'

        return <button type="button" className="lecture-frame__play-control _backwards"
                       onClick={::this._onClick}>
            <svg className="icon" width="32" height="21" dangerouslySetInnerHTML={{__html: _backwards}}/>
            <span className="label">-10</span>
        </button>
    }

    _onClick() {
        if (this.props.onClick) { this.props.onClick() }
    }
}

