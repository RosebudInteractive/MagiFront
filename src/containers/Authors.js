import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as authorsActions from "../actions/AuthorActions";
import Webix from '../components/Webix';
import YesNoDialog from "../components/YesNoDialog";
// import PropTypes from 'prop-types';
import { EDIT_MODE_EDIT, EDIT_MODE_INSERT } from "../constants/Common";
import AuthorsForm from '../components/AuthorForm';


class Authors extends React.Component {
    componentDidMount(){
        this.props.authorsActions.getAuthors();
    }

    onAddBtnClick() {
        this.props.authorsActions.showEditDialog(EDIT_MODE_INSERT)
    }

    onEditBtnClick() {
        this.props.authorsActions.showEditDialog(EDIT_MODE_EDIT)
    }

    deleteAuthor() {
        // this.props.episodesActions.deleteEpisode(this.props.selected)
    }

    confirmDeleteAuthor() {
        this.props.authorsActions.showDeleteConfirmation(this.props.selected)
    }

    cancelDelete() {
        this.props.authorsActions.cancelDelete()
    }

    getCurrentAuthor() {
        return this.props.authors.find((elem) => {
            return elem.id === this.props.selected
        })
    }

    saveAuthor(values) {
        this.props.authorsActions.saveAuthor(values, this.props.editMode)
    }

    cancelEdit() {
        this.props.authorsActions.hideEditDialog();
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
            editDlgShown,
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
            {
                editDlgShown ?
                    <AuthorsForm
                        save={::this.saveAuthor}
                        cancel={::this.cancelEdit}
                        author={::this.getCurrentAuthor()}
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
                {id: 'AccountId', header: 'Аккаунт', width: 150},
                {id: 'LanguageId', header: 'Язык', width: 150},
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
        hasError: state.authors.hasError,
        message: state.authors.message,
        selected: state.authors.selected,
        deleteDlgShown: state.authors.deleteDlgShown,
        errorDlgShown: state.authors.errorDlgShown,
        editDlgShown: state.authors.editDlgShown,
        editMode: state.authors.editMode
    }
}

function mapDispatchToProps(dispatch) {
    return {
        authorsActions: bindActionCreators(authorsActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Authors);