import React from 'react'
import {Field, reduxForm,} from 'redux-form'
import {TextBox} from "../../common/input-controls";
import TextArea from "../../common/text-area";
import FileLink from "../../common/file-link";
import PropTypes from "prop-types";
import {enableButtonsSelector} from "adm-ducks/app";
import {connect} from "react-redux";

const IMAGE_TYPE = {
    OG: 'og',
    TWITTER: 'twitter',
}

class CourseSocialNetworkForm extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
        visible: PropTypes.bool,
    }

    componentDidMount() {
        this._init()
    }

    _init() {
        let {course,} = this.props

        const _ogImage = this._getImage(IMAGE_TYPE.OG),
            _twitterImage = this._getImage(IMAGE_TYPE.TWITTER)

        if (course) {
            this.props.initialize({
                snName: course.SnName,
                snDescription: course.SnDescription,
                snPost: course.SnPost,
                ogImage: {
                    file: _ogImage ? _ogImage.FileName : '',
                    meta: _ogImage ? JSON.parse(_ogImage.MetaData) : '',
                },
                twitterImage : {
                    file: _twitterImage ? _twitterImage.FileName : '',
                    meta: _twitterImage ? JSON.parse(_twitterImage.MetaData) : '',
                },
            });
        }
    }

    componentWillUnmount() {
        this.props.reset();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.courseSaving && !this.props.courseSaving && !this.props.courseError) {
            this.props.destroy();
            this._init()
        }
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

    _getImage(type) {
        return this.props.course ? this.props.course.Images.find(image => image.Type === type) : null
    }
}

let CourseSocialNetworkWrapper = reduxForm({
    form: 'CourseSocialNetworkForm',
})(CourseSocialNetworkForm);

function mapStateToProps(state) {
    return {
        course: state.singleCourse.current,
        courseSaving: state.singleCourse.saving,
        courseError: state.singleCourse.error,
        enableButtons: enableButtonsSelector(state),
    }
}

export default connect(mapStateToProps,)(CourseSocialNetworkWrapper)
