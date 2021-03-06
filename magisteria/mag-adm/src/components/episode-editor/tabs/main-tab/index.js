import React from 'react'
import PropTypes from "prop-types";
import {connect} from "react-redux";
import ImportButton from "./import-button"
import {Field, formValueSelector, isDirty} from "redux-form";
import {CheckBox, TextBox} from "../../../common/input-controls";
import Select from "../../../common/select-control";
import TextArea from "../../../common/text-area";
import history from "../../../../history";
import AudioLink from "./audio-link-control"
import './main-tab.sass'

const EPISODE_TYPES = [
        {id: 'L', value: 'Лекция'},
    ],
    EPISODE_STATE = [
        {id: 'D', value: 'Черновик'},
        {id: 'R', value: 'Готовый'},
        {id: 'A', value: 'Архив'}
    ],
    CONTENT_TYPE = [
        {id: 1, value: 'Аудио'},
        {id: 2, value: 'Видео'},
    ]

class MainTab extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
        visible: PropTypes.bool,
        isWorkshop: PropTypes.bool,
        lessonId: PropTypes.number,
        episodeId: PropTypes.number,
    }

    render() {
        const {editMode, hasChanges, contentType} = this.props;

        const _disabled = false;

        return <div className={"tab-wrapper controls-wrapper" + (this.props.visible ? '' : ' hidden')}>
            <div className="main-tab__buttons-wrapper">
                <ImportButton episodeId={this.props.episodeId} lessonId={this.props.lessonId} disabled={_disabled || !editMode || hasChanges}/>
                <button className="adm__button bottom-controls__button" onClick={::this._openWorkshop} disabled={_disabled || !editMode}>
                    Перейти в монтажный стол
                </button>
            </div>
            <Field component={TextBox} name="name" label="Название эпизода" placeholder="Введите название эпизода" disabled={_disabled}/>
            <Field component={TextBox} name="number" label="Номер эпизода" disabled={true}/>
            <Field component={Select} name="episodeType" label="Тип эпизода" placeholder="Выберите тип эпизода" options={EPISODE_TYPES} disabled={_disabled}/>
            <Field component={Select} name="contentType" label="Тип контента" placeholder="Выберите тип контента" options={CONTENT_TYPE} disabled={_disabled}/>
            <Field component={CheckBox} name="supp" label="Дополнительный материал" disabled={true}/>
            <Field component={Select} name="state" label="Состояние" placeholder="Выберите состояние" options={EPISODE_STATE} disabled={_disabled}/>
            <Field component={AudioLink} name="audio" label="Аудио-контент" placeholder="Выберите аудио файл" disabled={_disabled || (+contentType !== 1)}/>
            <Field component={TextBox} name="videoLink" label="Видео-контент" placeholder="Введите URL YouTube" disabled={_disabled || (+contentType !== 2)}/>
            <Field component={TextArea} name="transcript" label="Транскрипт" enableHtml={true} disabled={_disabled}/>
        </div>

    }

    _openWorkshop(e) {
        e.preventDefault();

        if (!this.props.isWorkshop) {
            history.push(window.location.pathname + '?workshop')
        }
    }

}

const selector = formValueSelector('EpisodeEditor')

const _MainTab = connect(state => {
    return {
        contentType: selector(state, 'contentType'),
    }
})(MainTab)

function mapStateToProps(state) {
    return {
        packageUploadProcess: state.singleEpisode.packageUploadProcess,
        hasChanges: isDirty('EpisodeEditor')(state)
    }
}

export default connect(mapStateToProps)(_MainTab)