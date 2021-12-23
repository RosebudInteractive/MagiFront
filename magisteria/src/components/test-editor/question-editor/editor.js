import React from 'react'
import '../../common/modal-editor.sass'
import EditorWrapper from "./form-wrapper"
import PropTypes from "prop-types"
import {getFormValues, isDirty, isValid} from "redux-form";
import {connect} from "react-redux";

const EDITOR_NAME = "QuestionEditor"

class QuestionEditor extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
        data: PropTypes.object.isRequired,
        save: PropTypes.func.isRequired,
        cancel: PropTypes.func.isRequired,
        close: PropTypes.func,
        onPrevClick: PropTypes.func,
        onNextClick: PropTypes.func,
        scrollable: PropTypes.bool,
    };

    render() {
        return <div className="dlg">
            <div className="dlg-bg"/>
            <div className={"modal-editor question-editor" + (this.props.scrollable ? " scrollable" : "")}>
                <div className={"scroll-button button-prev" + (!this.props.onPrevClick || !this.props.editorValid  ? " disabled" : "")} onClick={::this._onPrevClick}/>
                <div className="modal-editor__wrapper">
                    <button type="button" className="modal-editor__close" onClick={::this._close}>Закрыть</button>
                    <EditorWrapper question={this.props.data}
                                   editMode={this.props.editMode}
                                   onSave={this.props.save}
                                   onClose={this.props.close}/>
                </div>
                <div className={"scroll-button button-next" + (!this.props.onNextClick || !this.props.editorValid ? " disabled" : "")} onClick={::this._onNextClick}/>
            </div>
        </div>
    }

    _doBeforeScroll() {
        let {editorValues, hasChanges, editorValid, data} = this.props

        if (hasChanges && editorValid) {
            this.props.save({...editorValues, Number: data.Number, id: data.id, Id: data.Id})
        }
    }

    _onPrevClick() {
        if (!this.props.editorValid) return

        this._doBeforeScroll()

        if (this.props.onPrevClick) {
            this.props.onPrevClick()
        }
    }

    _onNextClick() {
        if (!this.props.editorValid) return

        this._doBeforeScroll()

        if (this.props.onNextClick) {
            this.props.onNextClick()
        }
    }

    _close() {
        if (this.props.close) {
            this.props.close()
        }
    }
}

function mapStateToProps(state) {
    return {
        hasChanges: isDirty(EDITOR_NAME)(state),
        editorValues: getFormValues(EDITOR_NAME)(state),
        editorValid: isValid(EDITOR_NAME)(state),
    }
}

export default connect(mapStateToProps,)(QuestionEditor)