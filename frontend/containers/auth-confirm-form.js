import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as userActions from '../actions/user-actions'

class AuthConfirmForm extends React.Component {

    constructor(props) {
        super(props)
    }

    componentWillMount(){
        this.props.userActions.sendActivationKey(this.props.activationKey)
    }

    render() {
        let {error} = this.props;

        let _text = error ? <p>{'При активации произошла ошибка'} <br/>{error}</p> : <p>{'Активация прошла успшно'}</p>

        return (
            <div className="popup js-popup _registration opened">
                <button className="popup-close js-popup-close">Закрыть</button>
                <div className="success-message">
                    <p className="success-message__text">{_text}</p>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state, ownProps) {
    return {
        error: state.user.error,
        activationKey: ownProps.match.params.activationKey
    }
}

function mapDispatchToProps(dispatch) {
    return {
        userActions: bindActionCreators(userActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AuthConfirmForm);