import React from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {showEditorSelector, closeEditor, editModeSelector} from "adm-ducks/promo-codes";
import {getProducts,} from "adm-ducks/products";
import '../common/modal-editor.sass'
import EditorWrapper from "./form-wrapper"
import LoadingPage from "../common/loading-page";
import ErrorDialog from "../../components/dialog/error-dialog";
import PropTypes from "prop-types";

class PromoEditor extends React.Component {

    static propTypes = {
        onPrevClick: PropTypes.func,
        onNextClick: PropTypes.func,
    };

    UNSAFE_componentWillMount() {
        this.props.getProducts()
        // this.props.actions.getAuthors()
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
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
                        <div className={"modal-editor" + (this.props.editMode ? " scrollable" : "")}>
                            <div className={"scroll-button button-prev" + (!this.props.onPrevClick ? " disabled" : "")} onClick={::this._onPrevClick}/>
                            <div className="modal-editor__wrapper">
                                <button type="button" className="modal-editor__close" onClick={::this.props.closeEditor}>Закрыть</button>
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
        showEditor: showEditorSelector(state),
        fetching: state.courses.fetching || state.authorsList.fetching,
        editMode: editModeSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({closeEditor, getProducts}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(PromoEditor);