/**
 * Created by levan.kiknadze on 26/11/2017.
 */

import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class YesNoDialog extends Component {
    yesClicked() {
        const { yesAction, data } = this.props
        yesAction(data);
    }

    noClicked() {
        const { noAction, data } = this.props
        noAction(data);
    }

    render () {
        const { message } = this.props
        return <div className="dlg">
            <div className="dlg-bg">
            </div>
            <div className="dlg-window">
                <div className="dlg-message">{message}</div>
                <div className="dlg-btn-bar">
                    <button className="btn yes" onClick={::this.yesClicked}>Да</button>
                    <button className="btn no" onClick={::this.noClicked}>Нет</button>
                </div>
            </div>
        </div>
    }
}

YesNoDialog.propTypes = {
    message: PropTypes.string.isRequired,
    yesAction: PropTypes.func.isRequired,
    noAction: PropTypes.func.isRequired,
    data: PropTypes.any
}
