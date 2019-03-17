import React from 'react'
import {Field,} from 'redux-form'
import {TextBox} from "../../common/input-controls";
import TextArea from "../../common/text-area";
import Cover from "../../common/cover-control";
import PropTypes from "prop-types";

export default class SocialNetworkTab extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
        visible: PropTypes.bool,
    }

    render() {
        return <div className={"tab-wrapper controls-wrapper" + (this.props.visible ? '' : ' hidden')}>
            <Field component={TextBox} name="snName" label="Название" placeholder="Введите название"/>
            <Field component={TextArea} name="snDescription" label="Описание" enableHtml={false}/>
            <Field component={TextArea} name="snPost" label="Текст поста" enableHtml={false}/>
        </div>
    }
}
