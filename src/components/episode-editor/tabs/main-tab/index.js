import React from 'react'
import PropTypes from "prop-types";
import {connect} from "react-redux";
import ImportButton from "./import-buttom"
import {bindActionCreators} from 'redux';
import {Field} from "redux-form";
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

        // const {} = this.props;

        const _disabled = false;

        return <div className={"tab-wrapper controls-wrapper" + (this.props.visible ? '' : ' hidden')}>
            <div className="main-tab__buttons-wrapper">
                <ImportButton episodeId={this.props.episodeId} lessonId={this.props.lessonId}/>
                <button className="adm__button bottom-controls__button" onClick={::this._openWorkshop}>Перейти в
                    монтажный стол
                </button>
            </div>
            <Field component={TextBox} name="name" label="Название эпизода" placeholder="Введите название эпизода" disabled={_disabled}/>
            <Field component={TextBox} name="number" label="Номер эпизода" disabled={true}/>
            <Field component={Select} name="episodeType" label="Тип эпизода" placeholder="Выберите тип эпизода" options={EPISODE_TYPES} disabled={_disabled}/>
            <Field component={CheckBox} name="supp" label="Дополнительный материал" disabled={true}/>
            <Field component={Select} name="state" label="Состояние" placeholder="Выберите состояние" options={EPISODE_STATE} disabled={_disabled}/>
            <Field component={AudioLink} name="audio" label="Аудио-контент" placeholder="Выберите аудио файл" disabled={_disabled}/>
            <Field component={TextArea} name="transcript" label="Краткое описание" enableHtml={true} disabled={_disabled}/>
        </div>

    }

    _openWorkshop(e) {
        e.preventDefault();

        if (!this.props.isWorkshop) {
            history.push(window.location.pathname + '?workshop')
        }
    }

}

function mapStateToProps(state) {
    return {
        packageUploadProcess: state.singleEpisode.packageUploadProcess,
    }
}

function mapDispatchToProps(dispatch) {
    return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(MainTab)