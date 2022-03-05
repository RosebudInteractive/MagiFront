import React from 'react'
import {Field, reduxForm,} from 'redux-form'
import {TextBox} from "../../common/input-controls";
import TextArea from "../../common/text-area";
import FileLink from "../../common/file-link";
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

        return <div className={"form-wrapper non-webix-form" + (this.props.visible ? '' : ' hidden')}>
            <form className="controls-wrapper course-sn-tab">
                <Field component={TextBox} name="snName" label="Название" placeholder="Введите название" disabled={_disabled}/>
                <Field component={TextArea} name="snDescription" label="Описание" enableHtml={false} disabled={_disabled}/>
                <Field component={TextArea} name="snPost" label="Текст поста" enableHtml={false} disabled={_disabled}/>
                <Field component={FileLink} acceptType="image/*" id="og-image" name="ogImage" label="Изображение для Facebook" disabled={_disabled}/>
                <Field component={FileLink} acceptType="image/*" id="twitter-image" name="twitterImage" label="Изображение для Twitter" disabled={_disabled}/>
            </form>
        </div>
    }
}

function mapStateToProps(state) {
    return {
        enableButtons: enableButtonsSelector(state),
    }
}

export default connect(mapStateToProps,)(SocialNetworkTab)
