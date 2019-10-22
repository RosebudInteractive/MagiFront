import React from "react";
import PropTypes from "prop-types";
import {showSignInForm} from '../../../actions/user-actions'
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';

class SignInBlock extends React.Component {

    static propTypes = {
        onButtonClick: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);
    }

    render() {
        const LOGIN = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#login"/>'

        return !this.props.authorized &&
            <div className="user-block">
                <button className="login-btn js-login" onClick={::this.props.showSignInForm}>
                    <svg width="15" height="16" dangerouslySetInnerHTML={{__html: LOGIN}}/>
                    <span>Вход</span>
                </button>
            </div>
    }
}

function mapStateToProps(state) {
    return {
        authorized: !!state.user.user,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({showSignInForm}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(SignInBlock)