import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import { Link } from 'react-router-dom';
import FacebookLogin from 'react-facebook-login';
// import TiSocialFacebookCircular from 'react-icons/lib/ti/social-facebook-circular';
import {AUTHORIZATION_STATE} from '../../constants/user'

import * as userActions from '../../actions/user-actions'

class ButtonsBlock extends React.Component {

    _responseFacebook(response) {
        console.log(response);
    }


    render() {
        const _google = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#google"/>',
            _vk = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#vk-blue"/>',
            _facebook = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#facebook"/>';

        return <div className="register-block">
            {
                this.props.authorizationState === AUTHORIZATION_STATE.START_SIGN_IN ?
                    <p className="register-block__title">Войти с помошью</p>
                    :
                    <p className="register-block__title">Регистрация с помошью</p>
            }

            <button className="btn btn--white register-block__btn register-block__btn--fullwidth">
                        <span className="icon">
                            <svg width="16" height="16" dangerouslySetInnerHTML={{__html: _google}}/>
                        </span>
                <span className="text">Google</span>
            </button>
            <a href="#" className="btn btn--white register-block__btn register-block__btn--fullwidth">
                        <span className="icon">
                            <svg width="18" height="11" dangerouslySetInnerHTML={{__html: _vk}}/>
                        </span>
                <span className="text">Вконтакте</span>
            </a>
            <Link to={'/api/fblogin'} target={"_blank"}>
                <button className="btn btn--white register-block__btn register-block__btn--fullwidth">
                        <span className="icon">
                            <svg width="16" height="16" dangerouslySetInnerHTML={{__html: _facebook}}/>
                        </span>
                    <span className="text">Facebook</span>
                </button>
            </Link>
            <FacebookLogin
                appId="1584514044907807"
                autoLoad={true}
                fields="name,email,picture"
                scope="email,public_profile"
                callback={::this._responseFacebook}
                cssClass="btn btn--white register-block__btn register-block__btn--fullwidth"
                icon={<svg width="16" height="16" dangerouslySetInnerHTML={{__html: _facebook}}/>}
            />
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