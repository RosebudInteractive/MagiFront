import React from 'react'
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';
import {
    reduxForm,
    reset,
    isDirty,
    getFormValues,
    isValid
} from 'redux-form'
import MainTab from './tabs/main-tab'
import '../common/form.sass'
import BottomControls from "../bottom-contols/buttons";
import {booksSelector, bookIdSelector, editModeSelector, closeEditor, insertBook, updateBook, raiseNotExistBookError} from "adm-ducks/books"
import AuthorsTab from "./tabs/authors-tab";
import {checkBookExtLinks, getExtLinks} from "../../tools/link-tools";
import {showErrorDialog} from "../../actions/app-actions";

const TABS = {
    MAIN: 'main',
    AUTHORS: 'authors',
}

const NEW_BOOK = {
    Name: '',
    Description: null,
    CourseId: null,
    OtherAuthors: null,
    OtherCAuthors: null,
    Cover: null,
    CoverMeta: null,
    extLinksValues: null,
    Authors: [],
    Order: null,
}

class BookEditorForm extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            currentTab: TABS.MAIN,
        }
    }

    componentDidMount() {
        this._init()
    }

    _init() {
        let {editMode, books, bookId} = this.props,
            _book = editMode ?
                books.find((book) => { return book.Id === bookId })
                :
                NEW_BOOK

        if (_book) {
            this.props.initialize({
                name: _book.Name,
                description: _book.Description,
                extLinksValues: _book.extLinksValues,
                cover: {
                    file: _book.Cover,
                    meta: _book.CoverMeta,
                },
                otherAuthors: _book.OtherAuthors,
                otherCommentAuthors: _book.OtherCAuthors,
                authors: _book.Authors,
                course: _book.CourseId,
            });

            this._order = _book.Order;
        } else {
            this.props.raiseNotExistBookError()
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.bookId !== prevProps.bookId) {
            this._init()
        }
    }

    render() {
        const {hasChanges} = this.props;

        return <div className="editor course_editor">
            <div className='editor__head'>
                <div className="tabs tabs-1" key='tab1'>
                    <div className="tab-links">
                        <div
                            className={"tabs-1 tab-link" + (this.state.currentTab === TABS.MAIN ? ' tab-link-active' : '')}
                            onClick={::this._switchToMainTab}>Основные
                        </div>
                        <div
                            className={"tabs-1 tab-link" + (this.state.currentTab === TABS.AUTHORS ? ' tab-link-active' : '')}
                            onClick={::this._switchToAuthorsTab}>Авторы и курсы
                        </div>
                    </div>
                </div>
            </div>
            <div className="editor__main-area">
                <div className="main-area__container">
                    <form className={"form-wrapper non-webix-form"} action={"javascript:void(0)"}>
                        <MainTab visible={this.state.currentTab === TABS.MAIN} editMode={this.props.editMode}/>
                        <AuthorsTab visible={this.state.currentTab === TABS.AUTHORS} editMode={this.props.editMode}/>
                    </form>
                </div>
            </div>
            <div className="editor__footer">
                <BottomControls hasChanges={hasChanges} enableApplyChanges={this._enableApplyChanges()}
                                onAccept={::this._save} onCancel={::this._cancel} onBack={::this.props.closeEditor}/>
            </div>
        </div>
    }

    _switchToMainTab() {
        this.setState({
            currentTab: TABS.MAIN
        })
    }

    _switchToAuthorsTab() {
        this.setState({
            currentTab: TABS.AUTHORS
        })
    }

    _save() {
        let {editorValues, editMode, bookId,} = this.props,
            _values = Object.assign({}, editorValues)

        let _checkResult = checkBookExtLinks(_values.extLinksValues)

        if (_checkResult && _checkResult.length) {
            let _message = 'Недопустимые ссылки:\n' + _checkResult.join('\n')
            this.props.showErrorDialog(_message)
            return
        }

        _values.extLinksValues = getExtLinks(_values.extLinksValues)
        _values.course = (_values.course && +_values.course) ? +_values.course : null

        if (!editMode) {
            this.props.insertBook(_values)
        } else {
            _values.Id = bookId;
            _values.Order = this._order

            this.props.updateBook(_values)
        }

    }

    _cancel() {
        this.props.resetReduxForm('BookEditor')
    }

    _enableApplyChanges() {
        return this.props.editorValid
    }
}

const validate = (values) => {

    const errors = {}

    if (!values.name) {
        errors.name = 'Значение не может быть пустым'
    }

    if (!values.cover || !values.cover.file) {
        errors.cover = 'Значение не может быть пустым'
    }

    return errors
}

let BookEditorWrapper = reduxForm({
    form: 'BookEditor',
    validate,
})(BookEditorForm);

function mapStateToProps(state) {
    return {
        hasChanges: isDirty('BookEditor')(state),
        editorValues: getFormValues('BookEditor')(state),
        editorValid: isValid('BookEditor')(state),

        books: booksSelector(state),
        bookId: bookIdSelector(state),
        editMode: editModeSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({closeEditor, insertBook, updateBook, resetReduxForm: reset, showErrorDialog, raiseNotExistBookError}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(BookEditorWrapper)