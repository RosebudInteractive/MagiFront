import React from "react";
import {connect} from 'react-redux'
import {bindActionCreators} from "redux";
import {userConfirmationVisibleSelector, messageSelector, confirm, cancel} from "adm-ducks/messages";
import './dialog.sass'

class UserConfirmation extends React.Component {

    render() {
        const {visible, message,} = this.props

        return visible
            ?
            <div className="dialog adm-message">
                <div className="dialog-background"/>
                <div className="dialog-window">
                    <div className="dialog-message">{message}</div>
                    <div className="dialog-btn-bar">
                        <button className="btn" onClick={::this.props.confirm}>Да</button>
                        <button className="btn no default-button" onClick={::this.props.cancel} autoFocus={true}>Нет</button>
                    </div>
                </div>
            </div>
            :
            null
    }
}

function mapStateToProps(state) {
    return {
        visible: userConfirmationVisibleSelector(state),
        message: messageSelector(state)
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({confirm, cancel}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(UserConfirmation)