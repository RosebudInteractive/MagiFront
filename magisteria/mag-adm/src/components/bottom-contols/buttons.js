import React from 'react'
import PropTypes from 'prop-types'
import './bottomCtrls.sass'
import {connect} from "react-redux";
import {enableButtonsSelector} from "adm-ducks/app";

class BottomControls extends React.Component {

    static propTypes = {
        enableApplyChanges: PropTypes.bool,
        hasChanges: PropTypes.bool,
        onBack: PropTypes.func,
        onAccept: PropTypes.func,
        onCancel: PropTypes.func,
    }

    render() {
        return <div className="bottom-controls">
            <button className={"adm__button bottom-controls__button" + (!this._getEnableCancel() ? ' disabled' : '')}
                    onClick={::this.props.onCancel}>Отмена
            </button>
            <button className={"adm__button bottom-controls__button" + (!this._getEnableAccept() ? ' disabled' : '')}
                    onClick={::this._onAccept}>ОК
            </button>
            {
                this.props.onBack ?
                    <button className={"adm__button bottom-controls__button"}
                            onClick={::this._goBack}>{"<<< Назад"}</button>
                    :
                    null
            }
        </div>
    }

    _goBack() {
        if (this.props.onBack) {
            this.props.onBack()
        }
    }

    _getEnableAccept() {
        let {hasChanges, enableApplyChanges, enableButtons} = this.props;
        return hasChanges && enableApplyChanges && enableButtons
    }

    _getEnableCancel() {
        let {hasChanges, enableButtons} = this.props;
        return hasChanges && enableButtons
    }

    _onAccept() {
        if (this.props.onAccept && this._getEnableAccept()) {
            this.props.onAccept()
        }
    }
}

function mapStateToProps(state) {
    return {
        enableButtons: enableButtonsSelector(state)
    }
}

export default connect(mapStateToProps)(BottomControls);