import React from 'react';
import PropTypes from 'prop-types';
import {Redirect} from 'react-router';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as playerStartActions from '../../actions/player-start-actions'

class PlayBlock extends React.Component {

    static propTypes = {
        cover : PropTypes.string.isRequired,
        courseUrl : PropTypes.string.isRequired,
        lessonUrl : PropTypes.string.isRequired,
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
            <div className="lecture-full__play-block">
                <div className="play-block play-block--big">
                    <div className="play-block__image-wrapper" style={{backgroundImage: 'url(/data/' + this.props.cover + ')'}}/>
                    <div className="play-block__loader" id="cont" data-pct="100">
                        <svg className="svg-loader" id="svg" width="200" height="200" viewBox="0 0 200 200"
                             version="1.1" xmlns="http://www.w3.org/2000/svg">
                            <circle r={98.75} cx="100" cy="100" fill="transparent" strokeDasharray={565.48}
                                    strokeDashoffset={0}/>
                            <circle className="bar" id="bar" r={98.75} cx="100" cy="100" fill="transparent"
                                    strokeDasharray={565.48} strokeDashoffset={0}
                            />
                        </svg>
                    </div>
                    <button className="play-block__btn" onClick={::this._play}>
                        <svg width="41" height="36" dangerouslySetInnerHTML={{__html: _play}}/>
                    </button>
                    <div className="play-block__tooltip">Смотреть</div>
                    <div className="play-block__duration">{this.props.duration}</div>
                </div>
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