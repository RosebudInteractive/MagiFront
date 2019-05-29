import React from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {showEditorSelector, closeEditor,} from "adm-ducks/promo-codes";
import {getProducts,} from "adm-ducks/products";
import '../common/modal-editor.sass'
import EditorWrapper from "./form-wrapper"
import LoadingPage from "../common/loading-page";
import ErrorDialog from "../../components/dialog/error-dialog";

class PromoEditor extends React.Component {

    componentWillMount() {
        this.props.getProducts()
        // this.props.actions.getAuthors()
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.showEditor && nextProps.showEditor) {
            this.props.getProducts()
            // this.props.actions.getAuthors()
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
                            <button type="button" className="modal-editor__close" onClick={::this.props.closeEditor}>Закрыть</button>
                            <EditorWrapper/>
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
    return bindActionCreators({closeEditor, getProducts}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(PromoEditor);