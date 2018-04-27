import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import Wrapper from '../components/sign-in/sign-in-wrapper'

import * as userActions from '../actions/user-actions'

class SmallPlayer extends React.Component {
    render() {
        return (
            <div className="popup js-popup _registration opened">
                <button className="popup-close js-popup-close" onClose={::this.props.userActions.closeSignInForm}>Закрыть</button>
                <div className="sign-in-block">
                    <p className="sign-in-block__label">Уже зарегистрирован?</p>
                    <button className="btn btn--light sign-in-block__link">Вход</button>
                </div>
                <Wrapper/>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        paused: state.player.paused,
        stopped: state.player.stopped,
        ended: state.player.ended,
        playingLesson: state.player.playingLesson,
        showSmallPlayer: state.app.showSmallPlayer,
        isLessonMenuOpened: state.app.isLessonMenuOpened,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        userActions: bindActionCreators(userActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SmallPlayer);