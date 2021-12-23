import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as commonDlgActions from '../../actions/CommonDlgActions';
import './dialog.sass'

class ErrorDialog extends Component {
    okClicked() {
        this.props.commonDlgActions.confirmError();
    }

    render() {
        const {errorDlgShown, message} = this.props;

        return errorDlgShown ?
            <div className="dialog">
                <div className="dialog-bg"/>
                <div className="dialog-window">
                    <div className="dialog-message">{message}</div>
                    <div className="dialog-btn-bar">
                        <button className="btn yes" onClick={::this.okClicked}>Ok</button>
                    </div>
                </div>
            </div>
            :
            null
    }
}

function mapStateToProps(state) {
    return {
        // hasError: state.commonDlg.hasError,
        message: state.commonDlg.message,
        errorDlgShown: state.commonDlg.errorDlgShown,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        commonDlgActions: bindActionCreators(commonDlgActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ErrorDialog);
