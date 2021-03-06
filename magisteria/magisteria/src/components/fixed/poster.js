import React from 'react';
import PropTypes from 'prop-types'
import {Link} from "react-router-dom";
import {bindActionCreators} from "redux";
import * as playerStartActions from "actions/player-start-actions";
import * as userActions from "actions/user-actions";
import * as storageActions from "actions/lesson-info-storage-actions";
import {connect} from "react-redux";
import {Redirect} from "react-router";
import {notifyCourseLinkClicked, notifyLessonLinkClicked} from "ducks/google-analytics";
import browserHistory from "../../history";

const RATIO = 2.2875

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
        needLockLessonAsPaid: PropTypes.bool,
        analytics: PropTypes.object,
    }

    constructor(props) {
        super(props)

        this._redirect = false
        this._redirectWithoutPlay = false

        this._onLinkClickHandler = () => {
            if (!this.props.lessonUrl) {
                this.props.notifyCourseLinkClicked(this.props.analytics)
            } else {
                this.props.notifyLessonLinkClicked(this.props.analytics)
            }
        }

        this._resizeHandler = () => {
            // const _poster = $('#poster')
            //
            // if (_poster) {
            //     _poster.height(_poster.width() / RATIO)
            // }
        }
    }

    componentDidMount() {
        $('#img-fix-link').bind("click", this._onLinkClickHandler)

        window.addEventListener('resize', this._resizeHandler);

        this._resizeHandler()
    }

    componentWillUnmount() {
        $('#img-fix-link').unbind("click", this._onLinkClickHandler)
        window.removeEventListener('resize', this._resizeHandler);
    }

    render() {
        if (this._redirect) {
            this._redirect = false;
            browserHistory.push('/' + this.props.courseUrl + '/' + this.props.lessonUrl + '?play')
            return null
        }

        if (this._redirectWithoutPlay) {
            this._redirectWithoutPlay = false;
            browserHistory.push('/' + this.props.courseUrl + '/' + this.props.lessonUrl)
            return null
        }

        return (
            <div className="video-block" id="poster">
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
            return <Link to={'/category/' + courseUrl} id={'img-fix-link'}>
                <div className="video-block_cover" style={_coverStyle}/>
            </Link>
        } else {
            return <div className="video-block_cover" style={_coverStyle} onClick={(isAuthRequired && !authorized) ? ::this._unlock : ::this._play}/>
        }
    }

    _play() {
        this.props.playerStartActions.preinitAudios(this.props.audios);
        this._redirect = true;
        this.forceUpdate()
        this.props.playerStartActions.startPlay({lessonId: this.props.lessonId})
    }

    _unlock() {
        this.props.userActions.showSignInForm();
    }

    _goToLesson() {
        if (this.props.needLockLessonAsPaid) {
            let _currentLocation = window.location.pathname + window.location.search,
                _needLocation = '/' + this.props.courseUrl + '/' + this.props.lessonUrl

            if (_currentLocation !== _needLocation) {
                this._redirectWithoutPlay = true
                this.forceUpdate()
            }
        } else {
            this._play()
        }
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
            return <button className="play-block__btn paused" onClick={::this._goToLesson}>
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
        notifyCourseLinkClicked: bindActionCreators(notifyCourseLinkClicked, dispatch),
        notifyLessonLinkClicked: bindActionCreators(notifyLessonLinkClicked, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlayerBlock);
