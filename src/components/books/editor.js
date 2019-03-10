import React from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {showEditorSelector, closeEditor,} from "adm-ducks/books";
import '../common/modal-editor.sass'
import BookEditorWrapper from "./form-wrapper"
import {getCourses} from "../../actions/coursesListActions";
import {getAuthors} from "../../actions/authorsListActions";
import LoadingPage from "../common/loading-page";
import ErrorDialog from "../../components/dialog/error-dialog";

class BookEditor extends React.Component {

    componentWillMount() {
        this.props.actions.getCourses()
        this.props.actions.getAuthors()
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.showEditor && nextProps.showEditor) {
            this.props.actions.getCourses()
            this.props.actions.getAuthors()
        }
    }

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
                        <div className="modal-editor">
                            <button type="button" className="modal-editor__close" onClick={::this.props.actions.closeEditor}>Закрыть</button>
                            <BookEditorWrapper/>
                            <ErrorDialog/>
                        </div>
                }
            </div>
            :
            null
    }
}

function mapStateToProps(state) {
    return {
        showEditor: showEditorSelector(state),
        fetching: state.courses.fetching || state.authorsList.fetching,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({closeEditor, getCourses, getAuthors}, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(BookEditor);