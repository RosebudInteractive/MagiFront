import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {AUTHORIZATION_STATE} from '../../constants/user'

import * as userActions from '../../actions/user-actions'
import {waitingDataSelector as billingWaitingAuthData} from 'ducks/billing'
import {
    isWaitingAuthorize as isPlayerWaitingAuthorize,
    waitingDataSelector as playerWaitingAuthData,
} from 'ducks/player'
import {
    isWaitingAuthorize as isTestWaitingAuthorize,
    waitingDataSelector as testWaitingAuthData,
} from 'ducks/test-instance'
import $ from "jquery";
import PropTypes from "prop-types";

class ButtonsBlock extends React.Component {

    static propTypes = {
        showFacebook: PropTypes.bool
    }

    render() {
        const {authorizationState, showFacebook} = this.props;

        const _google = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#google"/>',
            _vk = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#vk-blue"/>',
            _facebook = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#facebook"/>';

        const _params = this._getRedirectParams();

        return <div className="register-block">
            {
                authorizationState === AUTHORIZATION_STATE.START_SIGN_IN ?
                    <p className="register-block__title">Войти с помощью</p>
                    :
                    <p className="register-block__title">Регистрация с помощью</p>
            }

            <a href={'/api/googlelogin' + _params}
               className="btn btn--white register-block__btn">
                        <span className="icon">
                            <svg width="16" height="16" dangerouslySetInnerHTML={{__html: _google}}/>
                        </span>
                <span className="text">Google</span>
            </a>
            <a href={'/api/vklogin' + _params}
               className="btn btn--white register-block__btn">
                        <span className="icon">
                            <svg width="18" height="11" dangerouslySetInnerHTML={{__html: _vk}}/>
                        </span>
                <span className="text">Вконтакте</span>
            </a>
            {
                showFacebook &&
                <a href={'/api/fblogin' + _params}
                   className="btn btn--white register-block__btn register-block__btn--fullwidth">
                        <span className="icon">
                            <svg width="16" height="16" dangerouslySetInnerHTML={{__html: _facebook}}/>
                        </span>
                    <span className="text">Facebook</span>
                </a>
            }
        </div>
    }

    _getRedirectParams() {
        let _data;

        if (this.props.billingWaitingAuthData) {
            let _key = Math.random().toString(36).substring(7)
            localStorage.setItem('s1', _key)

            _data = Object.assign({}, this.props.billingWaitingAuthData)
            _data.p1 = _key
            _data.t = 'b'
        } else if (this.props.isPlayerWaitingAuthorize) {
            let _key = Math.random().toString(36).substring(7)
            localStorage.setItem('s1', _key)

            _data = Object.assign({}, this.props.playerWaitingAuthData)
            _data.p1 = _key
            _data.t = 'p'
        } else if (this.props.isTestWaitingAuthorize) {
            let _key = Math.random().toString(36).substring(7)
            localStorage.setItem('s1', _key)

            _data = {}
            _data.url = this.props.testWaitingAuthData
            _data.p1 = _key
            _data.t = 't'
        } else {
            _data = {t: 'a'}
        }

        _data.pos = (window.$overflowHandler && window.$overflowHandler.enable) ? window.$overflowHandler.scrollPos : getScrollPage()

        let _params = '?' + $.param(_data)
        const _current = window.location.protocol + '//' + window.location.host + window.location.pathname;

        return '?redirect=' + encodeURIComponent(_current + _params)
    }
}

const getScrollPage = () => {
    let docScrollTop = 0;

    if (document.documentElement) {
        docScrollTop = document.documentElement.scrollTop;
    }

    return window.pageYOffset || docScrollTop;
};


function mapStateToProps(state) {
    return {
        authorizationState: state.user.authorizationState,
        billingWaitingAuthData: billingWaitingAuthData(state),
        isPlayerWaitingAuthorize: isPlayerWaitingAuthorize(state),
        playerWaitingAuthData: playerWaitingAuthData(state),
        isTestWaitingAuthorize: isTestWaitingAuthorize(state),
        testWaitingAuthData: testWaitingAuthData(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        userActions: bindActionCreators(userActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ButtonsBlock);