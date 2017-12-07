import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as authorsActions from "../actions/AuthorActions";
import * as commonDlgActions from '../actions/CommonDlgActions';

import Webix from '../components/Webix';
import YesNoDialog from "../components/YesNoDialog";
// import PropTypes from 'prop-types';
import { EDIT_MODE_EDIT, EDIT_MODE_INSERT } from "../constants/Common";
// import AuthorsForm from '../components/AuthorForm';


class Authors extends React.Component {
    componentDidMount(){
        this.props.authorsActions.getAuthors();
    }

    onAddBtnClick() {
        this.props.history.push('/authors/new');
        this.props.authorsActions.showEditDialog(EDIT_MODE_INSERT)
    }

    onEditBtnClick() {
        this.props.history.push('/authors/edit');
        this.props.authorsActions.showEditDialog(EDIT_MODE_EDIT)
    }

    deleteAuthor() {
        this.props.authorsActions.deleteAuthor(this.props.selected)
    }

    confirmDeleteAuthor() {
        this.props.commonDlgActions.showDeleteConfirmation(this.props.selected)
    }

    cancelDelete() {
        this.props.authorsActions.cancelDelete()
    }

    select(id) {
        this.props.authorsActions.selectAuthor(id);
    }

    render() {
        const {
            authors,
            fetching,
            hasError,
            message,
            selected,
            deleteDlgShown,
        } = this.props;

        return <div className="authors">
            {
                fetching ?
                    <p>Загрузка...</p>
                    :
                    hasError ?
                        <p>{message}</p>
                        :
                        <div className="authors-content">
                            <div className="action-bar">
                                <button className='btn'
                                        onClick={::this.onAddBtnClick}
                                >Добавить...</button>{' '}
                                <button
                                    className={'btn' + (selected === null ? " disabled" : "")}
                                    onClick={::this.onEditBtnClick}
                                    disabled={(selected === null)}
                                >Исправить...</button>{' '}
                                <button
                                    className={'btn' + (selected === null ? " disabled" : "")}
                                    onClick={::this.confirmDeleteAuthor}
                                    disabled={(selected === null)}
                                >Удалить...</button>
                            </div>
                            <div className="grid-container">
                                <Webix ui={::this.getUI(::this.select)} data={authors} />
                            </div>
                        </div>
            }
            {
                deleteDlgShown ?
                    <YesNoDialog
                        yesAction={::this.deleteAuthor}
                        noAction={::this.cancelDelete}
                        message="Удалить автора?"
                        data={selected}
                    />
                    :
                    ""
            }
        </div>
    }

    getUI(select) {
        return {
            view: "datatable",
            scroll: false,
            autoheight: true,
            select: true,
            editable: false,
            columns: [
                // {id: "AuthorId", header: "Идентификатор", width: 150},
                // {id: 'AccountId', header: 'Аккаунт', width: 150},
                // {id: 'LanguageId', header: 'Язык', width: 150},
                {id: 'FirstName', header: 'Имя', width: 200},
                {id: 'LastName', header: 'Фамилия', width: 300},
                {id: "Description", header: "Описание", fillspace: true},
                // {id: "active", header: "", width: 50, template: "{common.checkbox()}", readOnly: true},
                // {id: "created", header: "Создан", width: 150, format: this.formatDate},
                // {id: "updated", header: "Обновлен", width: 150, format: this.formatDate}
            ],
            on: {
                onAfterSelect: function (selObj) {
                    select(selObj.id);
                }
            }
        };
    }
}
//
// Authors.propTypes = {
//     episodes: PropTypes.array.isRequired,
//     hasError: PropTypes.bool.isRequired,
//     message: PropTypes.string,
//     selected: PropTypes.number,
//     deleteDlgShown: PropTypes.bool.isRequired,
//     errorDlgShown: PropTypes.bool.isRequired,
//     editDlgShown: PropTypes.bool.isRequired,
//     editMode: PropTypes.string.isRequired
// }

function mapStateToProps(state) {
    return {
        authors: state.authors.authors,
        selected: state.authors.selected,
        editDlgShown: state.authors.editDlgShown,
        editMode: state.authors.editMode,

        hasError: state.commonDlg.hasError,
        message: state.commonDlg.message,
        deleteDlgShown: state.commonDlg.deleteDlgShown,
        errorDlgShown: state.commonDlg.errorDlgShown,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        authorsActions: bindActionCreators(authorsActions, dispatch),
        commonDlgActions : bindActionCreators(commonDlgActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Authors);