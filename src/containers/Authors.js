import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as authorsActions from "../actions/authorsListActions";
import * as commonDlgActions from '../actions/CommonDlgActions';

import Webix from '../components/Webix';
import YesNoDialog from "../components/YesNoDialog";
import ErrorDialog from '../components/ErrorDialog';

class Authors extends React.Component {
    componentDidMount(){
        this.props.authorsActions.getAuthors();
    }

    onAddBtnClick() {
        this.props.history.push('/adm/authors/new');
    }

    onEditBtnClick() {
        this.props.history.push('/adm/authors/edit/' + this.props.selected);
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
            message,
            selected,
            errorDlgShown,
            deleteDlgShown,
        } = this.props;
        this._selected = selected;

        return <div className="authors">
            {
                fetching ?
                    <p>Загрузка...</p>
                    :
                    <div className="authors-content">
                        <div className="action-bar">
                            <button className='tool-btn new'
                                    onClick={::this.onAddBtnClick}
                            />
                            {' '}
                            <button
                                className={'tool-btn edit' + (selected === null ? " disabled" : "")}
                                onClick={::this.onEditBtnClick}
                                disabled={(selected === null)}
                            />
                            {' '}
                            <button
                                className={'tool-btn delete' + (selected === null ? " disabled" : "")}
                                onClick={::this._confirmDelete}
                                disabled={(selected === null)}
                            />
                        </div>
                        <div className="grid-container">
                            <Webix ui={::this.getUI(selected)} data={authors}/>
                        </div>
                    </div>
            }
            {
                errorDlgShown ?
                    <ErrorDialog
                        message={message}
                    />
                    :
                    ""
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

function mapStateToProps(state) {
    return {
        authors: state.authorsList.authors,
        selected: state.authorsList.selected,

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