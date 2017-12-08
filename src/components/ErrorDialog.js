import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as commonDlgActions from '../actions/CommonDlgActions';

class ErrorDialog extends Component {
    okClicked() {
        this.props.commonDlgActions.confirmError();
    }

    render () {
        const { message } = this.props;
        return <div className="dlg">
            <div className="dlg-bg">
            </div>
            <div className="dlg-window">
                <div className="dlg-message">{message}</div>
                <div className="dlg-btn-bar">
                    <button className="btn yes" onClick={::this.okClicked}>Ok</button>
                </div>
            </div>
        </div>
    }
}

ErrorDialog.propTypes = {
    message: PropTypes.string.isRequired,
    data: PropTypes.any
};

function mapDispatchToProps(dispatch) {
    return {
        commonDlgActions : bindActionCreators(commonDlgActions, dispatch),
    }
}

export default connect(null, mapDispatchToProps)(ErrorDialog);
