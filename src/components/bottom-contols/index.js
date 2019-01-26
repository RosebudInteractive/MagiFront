import React from 'react'
import PropTypes from 'prop-types'
import './bottomCtrls.sass'
import {connect} from "react-redux";
import {enableButtonsSelector} from "adm-ducks/app";

class BottomControls extends React.Component {

    static propTypes = {
        editor: PropTypes.object.isRequired
    }

    render() {
        return <div className="bottom-controls">
            <button className={"adm__button bottom-controls__button" + (!this._getEnableCancel() ? ' disabled' : '')} onClick={::this._cancel}>Отмена</button>
            <button className={"adm__button bottom-controls__button" + (!this._getEnableAccept() ? ' disabled' : '')} onClick={::this._accept}>ОК</button>
        </div>
    }

    _getEnableAccept() {
        let {editor, enableButtons} = this.props;
        return editor._hasChanges() && editor._enableApplyChanges() && enableButtons
    }

    _getEnableCancel() {
        let {editor, enableButtons} = this.props;
        return editor._hasChanges() && enableButtons
    }

    _accept() {
        let {editor} = this.props;

        if (editor.form && editor.form.validate()) {
            let _obj = editor.form.getValues();

            let _uploader = window.$$('file-uploader');
            if (_uploader) {
                let _id = window.$$('file-uploader').files.data.order[0];
                let _file = window.$$('file-uploader').files.getItem(_id);
                if (_file) {
                    _obj.fileInfo = _file[0];
                }
            }

            editor._save(_obj);
        }
    }

    _cancel() {
        let {editor} = this.props;

        if (editor.form) {
            editor.form.clearValidation();
            editor._cancel();
        }
    }
}

function mapStateToProps(state) {
    return {
        enableButtons: enableButtonsSelector(state)
    }
}

export default connect(mapStateToProps)(BottomControls);