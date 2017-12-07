/**
 * Created by levan.kiknadze on 12/11/2017.
 */

import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import PropTypes from 'prop-types'
import Webix from '../components/Webix';
import YesNoDialog from "../components/YesNoDialog"
import EpisodesForm from "../components/EpisodeForm"
import * as episodesActions from "../actions/EpisodesActions"
import { EDIT_MODE_EDIT, EDIT_MODE_INSERT } from "../constants/Common"

class Episodes extends Component {
    onAddBtnClick() {
        this.props.episodesActions.showEditDialog(EDIT_MODE_INSERT)
    }

    onEditBtnClick() {
        this.props.episodesActions.showEditDialog(EDIT_MODE_EDIT)
    }

    deleteEpisode() {
        this.props.episodesActions.deleteEpisode(this.props.selected)
    }

    confirmDeleteEpisode() {
        this.props.episodesActions.showDeleteConfirmation(this.props.selected)
    }

    cancelDelete() {
        this.props.episodesActions.cancelDelete()
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
        this.props.episodesActions.saveEpisode(values, this.props.editMode)
    }

    cancelEdit() {
        this.props.episodesActions.hideEditDialog();
    }

    select(id) {
        this.props.episodesActions.selectEpisode(id);
    }

    render() {
        const {
            episodes,
            fetching,
            hasError,
            message,
            selected,
            deleteDlgShown,
            editDlgShown
        } = this.props;
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
                                <button className='btn'
                                        onClick={::this.onAddBtnClick}
                                >Добавить...</button>{' '}
                                <button
                                    className={'btn' + (selected == null ? " disabled" : "")}
                                    onClick={::this.onEditBtnClick}
                                    disabled={selected == null}
                                >Исправить...</button>{' '}
                                <button
                                    className={'btn' + (selected == null ? " disabled" : "")}
                                    onClick={::this.confirmDeleteEpisode}
                                    disabled={selected == null}
                                >Удалить...</button>
                            </div>
                            <div className="grid-container">
                                <Webix ui={::this.getUI(::this.select)} data={episodes} />
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

    componentDidMount(){
        this.props.episodesActions.getEpisodes();
    }

}


Episodes.propTypes = {
    episodes: PropTypes.array.isRequired,
    hasError: PropTypes.bool.isRequired,
    message: PropTypes.string,
    selected: PropTypes.number,
    deleteDlgShown: PropTypes.bool.isRequired,
    errorDlgShown: PropTypes.bool.isRequired,
    editDlgShown: PropTypes.bool.isRequired,
    editMode: PropTypes.string.isRequired
}

function mapStateToProps(state) {
    return {
        episodes: state.episodes.episodes,
        hasError: state.episodes.hasError,
        message: state.episodes.message,
        selected: state.episodes.selected,
        deleteDlgShown: state.episodes.deleteDlgShown,
        errorDlgShown: state.episodes.errorDlgShown,
        editDlgShown: state.episodes.editDlgShown,
        editMode: state.episodes.editMode
    }
}

function mapDispatchToProps(dispatch) {
    return {
        episodesActions: bindActionCreators(episodesActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Episodes)
