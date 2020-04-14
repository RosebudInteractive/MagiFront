import React from 'react'
import {Field,} from 'redux-form'
import {TextBox} from "../../../common/input-controls";
import TextArea from "../../../common/text-area";
import PropTypes from "prop-types";
import RadioBox from "../../../common/radio-box-control";

const RADIO_BOX_VALUES = [
        {value: 1, text: "Да"},
        {value: 0, text: "Нет"},
    ]

export default class MainTab extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
        visible: PropTypes.bool,
    }

    render() {
        return <div className={"tab-wrapper controls-wrapper main-tab" + (this.props.visible ? '' : ' hidden')}>
            <Field component={TextArea} name="Text" label="Текст вопроса" enableHtml={false}/>
            <Field component={TextArea} name="Comment" label="Коментарий" enableHtml={true}/>
            <Field component={TextBox} name="AnswTime" label="Время на вопрос, сек" placeholder="Введите время, отводимое на ответ"/>
            <Field component={TextBox} name="Score" label="Количество баллов за правильный ответ" disabled={true}/>
            <Field component={TextBox} name="StTime" label="Начало времени эпизода, где можно послушать об этом"/>
            <Field component={TextBox} name="EndTime" label="Конец времени эпизода, где можно послушать об этом"/>
            <Field component={RadioBox} name="AllowedInCourse" label="Включать в сводном тесте" options={RADIO_BOX_VALUES}/>
            <Field component={TextBox} name="CorrectAnswResp" label="Текст в случае правильного ответа"/>
            <Field component={TextBox} name="WrongAnswResp" label="Текст в случае ошибочного ответа"/>
        </div>
    }
}