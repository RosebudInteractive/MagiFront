import React from 'react'
import {Field, formValueSelector,} from 'redux-form'
import {TextBox} from "../../common/input-controls";
import TextArea from "../../common/text-area";
import ImageLink, {IMAGE_TYPE} from "../image-link-control";
import PropTypes from "prop-types";
import {enableButtonsSelector} from "adm-ducks/app";
import {connect} from "react-redux";

class SocialNetworkTab extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
        visible: PropTypes.bool,
    }

    render() {
        let _disabled = !this.props.enableButtons;

        return <div className={"tab-wrapper controls-wrapper" + (this.props.visible ? '' : ' hidden')}>
            <Field component={TextBox} name="snName" label="Название" placeholder="Введите название" disabled={_disabled}/>
            <Field component={TextArea} name="snDescription" label="Описание" enableHtml={false} disabled={_disabled}/>
            <Field component={TextArea} name="snPost" label="Текст поста" enableHtml={false} disabled={_disabled}/>
            <Field component={ImageLink} name="ogImageResourceId" label="Изображение для Facebook" imageType={IMAGE_TYPE.OG} resources={this.props.resources} disabled={_disabled}/>
            <Field component={ImageLink} name="twitterImageResourceId" label="Изображение для Twitter" imageType={IMAGE_TYPE.TWITTER} resources={this.props.resources} disabled={_disabled}/>
        </div>
    }
}

const selector = formValueSelector('LessonEditor')

const _SocialNetworkTab = connect(state => {
    return {
        resources: selector(state, 'resources'),
    }
})(SocialNetworkTab)

function mapStateToProps(state) {
    return {
        enableButtons: enableButtonsSelector(state),
    }
}

export default connect(mapStateToProps,)(_SocialNetworkTab)
