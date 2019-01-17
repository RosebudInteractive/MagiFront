import React from 'react'
import PropTypes from 'prop-types'
import './bottomCtrls.sass'

export default class BottomControls extends React.Component {

    static propTypes = {
        editor: PropTypes.object.isRequired
    }



    render() {
        return <div className="bottom-controls">
            <button className={"adm__button bottom-controls__button" + (!this._getEnableCancel() ? ' disabled' : '')} onClick={::this._accept}>Отмена</button>
            <button className={"adm__button bottom-controls__button" + (!this._getEnableAccept() ? ' disabled' : '')} onClick={::this._accept}>ОК</button>
        </div>
    }

    _getEnableAccept() {
        let {editor} = this.props;
        return editor._hasChanges() && editor._enableApplyChanges() && !editor.props.fetching
    }

    _getEnableCancel() {
        let {editor} = this.props;
        return editor._hasChanges() && !editor.props.fetching
    }

    _accept() {

    }

    _cancel() {

    }

}