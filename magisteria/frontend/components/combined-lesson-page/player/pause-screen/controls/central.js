import React from 'react';
import PropTypes from "prop-types";

export default class Central extends React.Component {

    static propTypes = {
        paused: PropTypes.bool,
        onClick: PropTypes.func,
    }

    render() {
        const _pause = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#pause-shad"/>',
            _play = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#play-big"/>'

        return this.props.paused
            ?
            <button type="button" className="play-btn-big lecture-frame__play-btn ctrl"
                    onClick={::this._startPlay}>
                <span className="visually-hidden">Пауза</span>
                <svg className="play" width="97" height="86" dangerouslySetInnerHTML={{__html: _play}}/>
            </button>
            :
            <button type="button" className="play-btn-big lecture-frame__play-btn ctrl paused"
                    onClick={::this._startPause}>
                <span className="visually-hidden">Воспроизвести</span>
                <svg className="pause" width="68" height="92"
                     dangerouslySetInnerHTML={{__html: _pause}}/>
            </button>

    }

    _onClick() {
        if (this.props.onClick) {
            this.props.onClick()
        }
    }

}