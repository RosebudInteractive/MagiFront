import React from 'react';
import PropTypes from 'prop-types'
import {Link} from "react-router-dom";
import {bindActionCreators} from "redux";
import * as playerStartActions from "actions/player-start-actions";
import * as userActions from "actions/user-actions";
import * as storageActions from "actions/lesson-info-storage-actions";
import {connect} from "react-redux";
import {Redirect} from "react-router";

class PlayerBlock extends React.Component {

    static propTypes = {
        poster: PropTypes.string,
        visibleButton: PropTypes.bool,
        lessonId: PropTypes.number,
        isAuthRequired: PropTypes.bool,
        audios: PropTypes.array,
        courseUrl: PropTypes.string,
        lessonUrl: PropTypes.string,
        isPaidCourse: PropTypes.bool,
        isLessonFree: PropTypes.bool,
    }

    render() {
        if (this._redirect) {
            this._redirect = false;
            return <Redirect push to={'/' + this.props.courseUrl + '/' + this.props.lessonUrl + '?play'}/>;
        }

        return (
            <div className="video-block">
                {this._getPoster()}
                {this._getButton()}
            </div>
        )
    }

    _getPoster() {
        let {poster, courseUrl, lessonUrl, isAuthRequired, authorized} = this.props;

        const _coverStyle = {
            backgroundImage: "url(" + poster + ")",
        }

        if (!lessonUrl) {
            return <Link to={'/category/' + courseUrl}>
                <video src="#" style={_coverStyle}/>
            </Link>
        } else {
            return <video src="#" style={_coverStyle} onClick={(isAuthRequired && !authorized) ? ::this._unlock : ::this._play}/>
        }
    }

    _play() {
        this.props.playerStartActions.preinitAudios(this.props.audios);
        this._redirect = true;
        this.forceUpdate()
        this.props.playerStartActions.startPlay(this.props.lessonId)
    }

    _unlock() {
        this.props.userActions.showSignInForm();
    }

    _getButton() {
        if (!this.props.visibleButton) { return null }

        let {lessonId, isAuthRequired, authorized, isPaidCourse, isLessonFree} = this.props,
            _lessonInfo = this.props.lessonInfoStorage.lessons.get(lessonId),
            _isFinished = _lessonInfo ? _lessonInfo.isFinished : false,
            _button = null;


        const _play = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#play"/>',
            _replay = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#reload"/>',
            _crown = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#crown"/>',
            _lock = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#lock"/>'

        if (isPaidCourse && !isLessonFree) {
            return <button className="play-block__btn paused" onClick={::this._unlock}>
                <svg width="27" height="30" dangerouslySetInnerHTML={{__html: _crown}}/>
            </button>
        } else if (isAuthRequired && !authorized) {
            _button = <button className="play-block__btn paused" onClick={::this._unlock}>
                <svg width="27" height="30" dangerouslySetInnerHTML={{__html: _lock}}/>
            </button>
        } else {
            _button = <button className="play-block__btn" onClick={::this._play}>
                {_isFinished
                    ?
                    <svg width="34" height="34" dangerouslySetInnerHTML={{__html: _replay}}/>
                    :
                    <svg width="102" height="90" dangerouslySetInnerHTML={{__html: _play}}/>
                }
            </button>
        }

        return _button;
    }
}


function mapStateToProps(state) {
    return {
        lessonInfoStorage: state.lessonInfoStorage,
        authorized: !!state.user.user,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        playerStartActions: bindActionCreators(playerStartActions, dispatch),
        userActions: bindActionCreators(userActions, dispatch),
        storageActions: bindActionCreators(storageActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlayerBlock);