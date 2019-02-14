import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';

import * as userActions from '../actions/user-actions'
import Wrapper from "../components/password-confirm/wrapper";

class PasswordConfirmForm extends React.Component {

    constructor(props) {
        super(props)
    }

    componentWillMount() {
        this.props.userActions.switchToPasswordConfirm();
        this.props.userActions.getActivationUser(this.props.activationKey)
    }

    render() {
        let {fetching, activationKey} = this.props;

        return fetching ?
            <div className="popup js-popup _registration opened"/>
            :
            <div className="popup js-popup _registration opened">
                <Link to={'/'}>
                    <button className="popup-close js-popup-close">Закрыть</button>
                </Link>
                <Wrapper activationKey={activationKey}/>
            </div>
    }
}

function mapStateToProps(state, ownProps) {
    return {
        error: state.user.error,
        user: state.user.user,
        activationKey: ownProps.match.params.activationKey,
        fetching: state.app.fetching,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        userActions: bindActionCreators(userActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PasswordConfirmForm);