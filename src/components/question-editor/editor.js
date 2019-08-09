import React from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {showQuestionEditorSelector, questionInEditModeSelector, closeQuestionEditor} from "adm-ducks/single-test";
import '../common/modal-editor.sass'
import EditorWrapper from "./form-wrapper"
import LoadingPage from "../common/loading-page";
import ErrorDialog from "../../components/dialog/error-dialog";
import PropTypes from "prop-types"

class QuestionEditor extends React.Component {

    static propTypes = {
        onPrevClick: PropTypes.func,
        onNextClick: PropTypes.func,
    };

    render() {
        let {showEditor, fetching,} = this.props

        return showEditor
            ?
            <div className="dlg">
                <div className="dlg-bg"/>
                {
                    fetching ?
                        <LoadingPage/>
                        :
                        <div className={"modal-editor" + (this.props.editMode ? " scrollable" : "")}>
                            <div className={"scroll-button button-prev" + (!this.props.onPrevClick ? " disabled" : "")} onClick={::this._onPrevClick}/>
                            <div className="modal-editor__wrapper">
                                <button type="button" className="modal-editor__close" onClick={::this.props.closeQuestionEditor}>Закрыть</button>
                                <EditorWrapper/>
                                <ErrorDialog/>
                            </div>
                            <div className={"scroll-button button-next" + (!this.props.onNextClick ? " disabled" : "")} onClick={::this._onNextClick}/>
                        </div>
                }
            </div>
            :
            null
    }

    _onPrevClick() {
        if (this.props.onPrevClick) {
            this.props.onPrevClick()
        }
    }

    _onNextClick() {
        if (this.props.onNextClick) {
            this.props.onNextClick()
        }
    }

}

function mapStateToProps(state) {
    return {
        showEditor: showQuestionEditorSelector(state),
        // fetching: state.courses.fetching || state.authorsList.fetching,
        editMode: questionInEditModeSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({closeQuestionEditor,}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(QuestionEditor);