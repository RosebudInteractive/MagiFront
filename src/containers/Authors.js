import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as authorsActions from "../actions/AuthorActions";
import * as commonDlgActions from '../actions/CommonDlgActions';

import Webix from '../components/Webix';
import YesNoDialog from "../components/YesNoDialog";
import { EDIT_MODE_EDIT, EDIT_MODE_INSERT } from "../constants/Common";

class Authors extends React.Component {
    componentDidMount(){
        this.props.authorsActions.getAuthors();
        this._selected = null;
    }

    onAddBtnClick() {
        this.props.history.push('/authors/new');
        this.props.authorsActions.showEditDialog(EDIT_MODE_INSERT)
    }

    onEditBtnClick() {
        this.props.history.push('/authors/edit/' + this.props.selected);
        this.props.authorsActions.showEditDialog(EDIT_MODE_EDIT)
    }

    deleteAuthor() {
        this.props.authorsActions.deleteAuthor(this.props.selected)
    }

    _confirmDelete() {
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
        this._selected = selected;

        return <div className="authors">
            {
                fetching ?
                    <p>Загрузка...</p>
                    :
                    hasError ?
                        <p>{message}</p>
                        :
                        <div className="authors-content">
                            <div className="action-bar" style={{marginTop: 5, marginBottom: -10, marginLeft: 2}}>
                                <button className='btn-new'
                                        onClick={::this.onAddBtnClick}
                                />{' '}
                                <button
                                    className={'btn-edit' + (selected === null ? " disabled" : "")}
                                    onClick={::this.onEditBtnClick}
                                    disabled={(selected === null)}
                                />{' '}
                                <button
                                    className={'btn-delete' + (selected === null ? " disabled" : "")}
                                    onClick={::this._confirmDelete}
                                    disabled={(selected === null)}
                                />
                            </div>
                            <div className="grid-container">
                                <Webix ui={::this.getUI(::this.select, selected)} data={authors} />
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

    getUI() {
        let that = this;

        return {
            view: "datatable",
            scroll: false,
            autoheight: true,
            select: true,
            editable: false,
            columns: [
                {id: 'FirstName', header: 'Имя', width: 200},
                {id: 'LastName', header: 'Фамилия', width: 300},
                {id: "Description", header: "Описание", fillspace: true},
            ],
            on: {
                onAfterSelect: function (selObj) {
                    if (selObj.id !== that._selected)
                        that._selected = null;
                    that.select(selObj.id);
                },
                onAfterRender: function() {
                    if ((that._selected) && this.getItem(that._selected)) {
                        this.select(that._selected)
                    }
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