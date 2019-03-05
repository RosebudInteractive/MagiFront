import React from 'react'
import {Field,} from 'redux-form'
import {TextBox} from "../../common/input-controls";
import TextArea from "../../common/text-area";
import Cover from "../../common/cover-control";
import PropTypes from "prop-types";

export default class MainTab extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
        visible: PropTypes.bool,
    }

    render() {
        return <div className={"tab-wrapper controls-wrapper" + (this.props.visible ? '' : ' hidden')}>
            <Field component={TextBox} name="name" label="Название книги" placeholder="Введите название"/>
            <Field component={TextArea} name="description" label="Описание книги" enableHtml={true}/>
            <Field component={Cover} name="cover" label="Обложка книги"/>
            <Field component={TextArea} name="extLinksValues" label="Ссылки на другие ресурсы" enableHtml={false} />
        </div>
    }
}