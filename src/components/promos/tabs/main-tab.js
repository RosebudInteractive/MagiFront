import React from 'react'
import {Field,} from 'redux-form'
import {TextBox} from "../../common/input-controls";
import TextArea from "../../common/text-area";
import PropTypes from "prop-types";
import Datepicker from "../../common/date-time-control";

export default class MainTab extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
        visible: PropTypes.bool,
    }

    render() {
        return <div className={"tab-wrapper controls-wrapper" + (this.props.visible ? '' : ' hidden')}>
            <Field component={TextBox} name="code" label="Промокод" placeholder="Введите промокод"/>
            <Field component={TextArea} name="description" label="Описание промокода" enableHtml={false}/>
            <Field component={TextBox} name="perc" label="Скидка"/>
            <Field component={TextBox} name="counter" label="Счетчик"/>
            <Field component={TextBox} name="rest" label="Осталось" disabled={true}/>
            <Field component={Datepicker} name="firstDate" label="Дата начала" showTime={true}/>
            <Field component={Datepicker} name="lastDate" label="Дата окончания" showTime={true}/>
        </div>
    }
}