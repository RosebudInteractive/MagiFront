import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {AUTHORIZATION_STATE} from '../../constants/user'

import * as userActions from '../../actions/user-actions'

class ButtonsBlock extends React.Component {

    render() {
        const _google = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#google"/>',
            _vk = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#vk-blue"/>',
            _facebook = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#facebook"/>';

        return <div className="register-block">
            {
                this.props.authorizationState === AUTHORIZATION_STATE.START_SIGN_IN ?
                    <p className="register-block__title">Войти с помошью</p>
                    :
                    <p className="register-block__title">Регистрация с помощью</p>
            }

            <a href={'/api/googlelogin?redirect=/category/pushkin'}
                  className="btn btn--white register-block__btn">
                        <span className="icon">
                            <svg width="16" height="16" dangerouslySetInnerHTML={{__html: _google}}/>
                        </span>
                <span className="text">Google</span>
            </a>
            <a href={'/api/vklogin?redirect=/category/pushkin'}
                  className="btn btn--white register-block__btn">
                        <span className="icon">
                            <svg width="18" height="11" dangerouslySetInnerHTML={{__html: _vk}}/>
                        </span>
                <span className="text">Вконтакте</span>
            </a>
            <a href={'/api/fblogin?redirect=/category/pushkin'}
                  className="btn btn--white register-block__btn register-block__btn--fullwidth">
                        <span className="icon">
                            <svg width="16" height="16" dangerouslySetInnerHTML={{__html: _facebook}}/>
                        </span>
                <span className="text">Facebook</span>
            </a>
        </div>
    }
}


function mapStateToProps(state) {
    return {
        authorizationState: state.user.authorizationState,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        userActions: bindActionCreators(userActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ButtonsBlock);