import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {AUTHORIZATION_STATE} from '../../constants/user'

import * as userActions from '../../actions/user-actions'
import {waitingDataSelector} from 'ducks/billing'
import $ from "jquery";
import ScrollMemoryStorage from "../../tools/scroll-memory-storage";

class ButtonsBlock extends React.Component {

    render() {
        const _google = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#google"/>',
            _vk = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#vk-blue"/>',
            _facebook = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#facebook"/>';

        const _params = this._getRedirectParams();

        return <div className="register-block">
            {
                this.props.authorizationState === AUTHORIZATION_STATE.START_SIGN_IN ?
                    <p className="register-block__title">Войти с помошью</p>
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
            <a href={'/api/fblogin' + _params}
               className="btn btn--white register-block__btn register-block__btn--fullwidth">
                        <span className="icon">
                            <svg width="16" height="16" dangerouslySetInnerHTML={{__html: _facebook}}/>
                        </span>
                <span className="text">Facebook</span>
            </a>
        </div>
    }

    _getRedirectParams() {
        let _params = '';

        if (this.props.waitingData) {
            let _key = Math.random().toString(36).substring(7)
            localStorage.setItem('s1', _key)

            let _data = Object.assign({}, this.props.waitingData)
            _data.p1 = _key
            _data.b = true
            _data.pos = (window.$overflowHandler && window.$overflowHandler.enable) ? window.$overflowHandler.scrollPos : getScrollPage()

            _params = '?' + $.param(_data)
        }
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
        waitingData: waitingDataSelector(state)
    }
}

function mapDispatchToProps(dispatch) {
    return {
        userActions: bindActionCreators(userActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ButtonsBlock);