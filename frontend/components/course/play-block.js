import React from 'react';
import PropTypes from 'prop-types';
import {Redirect} from 'react-router';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as playerStartActions from '../../actions/player-start-actions'

class PlayBlock extends React.Component {

    constructor(props) {
        super(props)

        this._redirect = false
    }

    static propTypes = {
        lessonUrl: PropTypes.string.isRequired,
        courseUrl: PropTypes.string.isRequired,
        audios: PropTypes.array.isRequired,
    }

    _play() {
        this.props.playerStartActions.preinitAudios(this.props.audios);
        this._redirect = true;
        this.forceUpdate()
    }

    render() {
        const _play = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#play"/>';

        if (this._redirect) {
            this._redirect = false;
            return <Redirect push to={'/' + this.props.courseUrl + '/' + this.props.lessonUrl + '?play'}/>;
        }

        return (
            <div className='lecture__play-block'>

                <div className="lecture__image-wrapper">
                    <img src={this.props.cover} width="126" height="126" alt=""/>
                </div>
                <div className="lecture__loader" id="cont" data-pct="100">
                    <svg className="svg-loader" id="svg" width="200" height="200" viewBox="0 0 200 200" version="1.1"
                         xmlns="http://www.w3.org/2000/svg">
                        <circle r="98.25" cx="100" cy="100" fill="transparent" strokeDasharray="620"
                                strokeDashoffset="0"/>
                        <circle className="bar" id="bar" r="98.25" cx="100" cy="100" fill="transparent"
                                strokeDasharray="383.274" strokeDashoffset="157.142"/>
                    </svg>
                </div>
                <input className="loader-field" id="percent" name="percent" value="75" readOnly={true}/>
                <button type="button" className="lecture__btn" onClick={::this._play}>
                    <svg width="41" height="36" dangerouslySetInnerHTML={{__html: _play}}/>
                </button>
                <div className="lecture__tooltip">Смотреть</div>
                <div className='duration'>{this.props.duration}</div>
            </div>
        )
    }
}

function mapDispatchToProps(dispatch) {
    return {
        playerStartActions: bindActionCreators(playerStartActions, dispatch),
    }
}

export default connect(null, mapDispatchToProps)(PlayBlock);