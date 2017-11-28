/**
 * Created by levan.kiknadze on 12/11/2017.
 */

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Webix from '../components/Webix';
import YesNoDialog from "../components/YesNoDialog"
import EpisodesForm from "../components/EpisodeForm"
import { EDIT_MODE_EDIT, EDIT_MODE_INSERT } from "../constants/Episodes"

export default class Episodes extends Component {
    onAddBtnClick() {
        this.props.showEditDlg(EDIT_MODE_INSERT)
    }

    onEditBtnClick() {
        this.props.showEditDlg(EDIT_MODE_EDIT)
    }

    deleteEpisode() {
        this.props.delete(this.props.selected)
    }

    confirmDeleteEpisode() {
        this.props.showDeleteDlg(this.props.selected)
    }

    cancelDelete() {
        this.props.hideDeleteDlg()
    }

    getCurrentEpisode() {
        for (var i in this.props.episodes) {
            var e = this.props.episodes[i]
            if (e.id == this.props.selected) {
                return e
            }
        }
        return null
    }

    saveEpisode(values) {
        this.props.saveEpisode(values, this.props.editMode)
    }

    cancelEdit() {
        this.props.hideEditDlg();
    }

    render() {
        const {
            episodes,
            fetching,
            hasError,
            message,
            select,
            selected,
            deleteDlgShown,
            editDlgShown
        } = this.props
        return <div className="episodes">
            {
                fetching ?
                    <p>Загрузка...</p>
                    :
                    hasError ?
                        <p>{message}</p>
                        :
                        <div className="episodes-content">
                            <div className="action-bar">
                                <button c
                                        className='btn'
                                        onClick={::this.onAddBtnClick}
                                >Добавить...</button>{' '}
                                <button
                                    className={'btn' + (selected == null ? " disabled" : "")}
                                    onClick={::this.onEditBtnClick}
                                    disabled={selected == null}
                                >Исправить...</button>
                                <button
                                    className={'btn' + (selected == null ? " disabled" : "")}
                                    onClick={::this.confirmDeleteEpisode}
                                    disabled={selected == null}
                                >Удалить...</button>
                            </div>
                            <div className="grid-container">
                                <Webix ui={::this.getUI(select)} data={episodes} />
                            </div>
                        </div>
            }
            {
                deleteDlgShown ?
                    <YesNoDialog
                        yesAction={::this.deleteEpisode}
                        noAction={::this.cancelDelete}
                        message="Удалить эпизод?"
                        data={selected}
                    />
                    :
                    ""
            }
            {
                editDlgShown ?
                    <EpisodesForm
                        save={::this.saveEpisode}
                        cancel={::this.cancelEdit}
                        episode={::this.getCurrentEpisode()}
                    />
                    :
                    ""
            }
        </div>
    }

    getUI(select){
        return {
            view:"datatable",
            scroll:false,
            autoheight:true,
            select:true,
            editable:false,
            columns:[
                { id:"code", header: "Идентификатор", width:200 },
                { id:"name", header: "Описание", fillspace:true },
                { id:"active", header: "", width: 50, template:"{common.checkbox()}", readOnly: true },
                { id:"created", header: "Создан", width: 150, format:this.formatDate },
                { id:"updated", header: "Обновлен", width: 150, format: this.formatDate }
            ],
            on:{
                onAfterSelect:function(selObj){
                    select(selObj.id);
                }
            }
        };
    }

    formatDate(data) {
        var fn = window.webix.Date.dateToStr("%d.%m.%Y %H:%i", true)
        return fn(new Date(data));
    }

}


Episodes.propTypes = {
    episodes: PropTypes.array.isRequired,
    getEpisodes: PropTypes.func.isRequired,
    hasError: PropTypes.bool.isRequired,
    message: PropTypes.string,
    selected: PropTypes.number,
    select: PropTypes.func.isRequired,
    deleteDlgShown: PropTypes.bool.isRequired,
    errorDlgShown: PropTypes.bool.isRequired,
    showDeleteDlg: PropTypes.func.isRequired,
    hideDeleteDlg: PropTypes.func.isRequired,
    delete: PropTypes.func.isRequired,
    editDlgShown: PropTypes.bool.isRequired,
    editMode: PropTypes.string.isRequired,
    showEditDlg: PropTypes.func.isRequired,
    hideEditDlg: PropTypes.func.isRequired,
    saveEpisode: PropTypes.func.isRequired
}
