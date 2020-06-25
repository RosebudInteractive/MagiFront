import React from 'react'
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';
import {
    reduxForm,
    isDirty,
    getFormValues,
    isValid, Field, formValueSelector, change,
} from 'redux-form'
import '../common/form.sass'
import BottomControls from "../bottom-contols/buttons";
import {showErrorDialog} from "../../actions/app-actions";
import moment from "moment";
import {TextBox} from "../common/input-controls";
import TextArea from "../common/text-area";
import Datepicker from "../common/date-time-control";
import {
    reviewsSelector,
    selectedIdSelector,
    editModeSelector,
    insertReview,
    updateReview,
    closeEditor,
    raiseNotExistReviewError,
    checkUser,
} from "adm-ducks/reviews";
import Select from "../common/select-control";
import {coursesSelector} from "adm-ducks/course";

const STATE_OPTIONS = [
    {id: 1, value: 'Опубликованный'},
    {id: 2, value: 'На модерации'},
    {id: 3, value: 'Архив'}
]

const NEW_REVIEW = {
    Status: 2,
    ReviewDate: Date.now(),
}

class ReviewEditorForm extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this._init()
    }

    _init() {
        let {editMode, reviews, reviewId} = this.props,
            _review = editMode ?
                reviews.find((item) => { return item.Id === +reviewId })
                :
                NEW_REVIEW

        if (_review) {
            let _reviewDate = _review.ReviewDate ?
                typeof _review.ReviewDate === 'string' ?
                    moment(new Date(_review.ReviewDate))
                    :
                    _review.ReviewDate
                :
                ''


            this.props.initialize({
                title: _review.Title,
                courseId: _review.CourseId,
                status: _review.Status,
                reviewDate: _reviewDate,
                userId: _review.UserId,
                userEmail: _review.UserEmail,
                userName: _review.UserName,
                profileUrl: _review.ProfileUrl,
                review: _review.Review,
                reviewPub: _review.ReviewPub ? _review.ReviewPub : _review.Review,
            });
        } else {
            this.props.raiseNotExistReviewError()
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.reviewId !== prevProps.reviewId) {
            this._init()
        }
    }

    render() {
        const {hasChanges} = this.props;

        return <div className="editor review_editor">
            <div className="editor__main-area">
                <div className="main-area__container">
                    <form className={"form-wrapper non-webix-form"} action={"javascript:void(0)"}>
                        <div className="controls-wrapper no-tabs-form">
                            <Field component={TextBox} name="title" label="Название" placeholder="Введите название"/>
                            <Field component={Select} name="courseId" label="Курс" placeholder="Выберите курс" options={this._getCourses()}/>
                            <Field component={Select} name="status" label="Состояние" placeholder="Выберите состояние" options={STATE_OPTIONS}/>
                            <Field component={Datepicker} name="reviewDate" label="Дата отзыва" showTime={false}/>
                            <Field component={TextBox} name="userEmail" label="Email пользователя" placeholder="Введите email пользователя"/>
                            <Field component={TextBox} name="userName" label="Отображаемое имя" placeholder="Введите имя пользователя"/>
                            <Field component={TextBox} name="profileUrl" label="Ссылка на профиль" placeholder="Ссылка на профиль в любой соцсети"/>

                            <Field component={TextArea} name="review" label="Текст отзыва" enableHtml={false} id={"review"}/>
                            <Field component={TextArea} name="reviewPub" label="Публекуемый отзыв" enableHtml={false} id={"pub-review"}/>
                        </div>
                    </form>
                </div>
            </div>
            <div className="editor__footer">
                <BottomControls hasChanges={hasChanges} enableApplyChanges={this._enableApplyChanges()}
                                onAccept={::this._save} onCancel={::this._cancel} onBack={::this.props.closeEditor}/>
            </div>
        </div>
    }

    _getCourses() {
        let {courses} = this.props;

        if (!courses || (courses.length < 1)) {
            return null
        }

        let _options = this.props.courses.map((course) => {
            return {id: course.id, value: course.Name}
        })


        _options.sort((a, b) =>  {
            return a.value.localeCompare(b.value);
        })

        return _options
    }

    _save() {
        let {editorValues, editMode, reviewId,} = this.props,
            _values = Object.assign({}, editorValues)

        if (!editMode) {
            this.props.insertReview(_values)
        } else {
            _values.Id = reviewId;

            this.props.updateReview(_values)
        }

    }

    _cancel() {
        this.props.reset('ReviewEditor')
    }

    _enableApplyChanges() {
        return this.props.editorValid
    }
}

const validate = (values,) => {

    const errors = {}

    if (!values.courseId) {
        errors.courseId = 'Значение не может быть пустым'
    }

    if (!values.userEmail) {
        errors.userEmail = 'Значение не может быть пустым'
    }

    if (!values.review) {
        errors.review = 'Значение не может быть пустым'
    }

    if (!values.reviewPub) {
        errors.reviewPub = 'Значение не может быть пустым'
    }

    return errors
}

const asyncValidate = (values, dispacth,) => {
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.userEmail)) {
        return new Promise(() => {throw {userEmail: 'Недопустимый email'}})
    } else {
        return checkUser({email: values.userEmail})
            .then((userInfo) => {
                if (userInfo && userInfo.Id) {
                    dispacth(change('ReviewEditor', 'userId', userInfo.Id))
                    dispacth(change('ReviewEditor', 'userName', userInfo.DisplayName))
                }
            }).catch((error) => {
                throw {userEmail: error.message}
            })
    }
}

let ReviewEditorWrapper = reduxForm({
    form: 'ReviewEditor',
    validate,
    asyncValidate,
    asyncChangeFields: ['userEmail'],
    asyncBlurFields: ['userEmail'],
})(ReviewEditorForm);

const selector = formValueSelector('ReviewEditor')

function mapStateToProps(state) {
    return {
        hasChanges: isDirty('ReviewEditor')(state),
        editorValues: getFormValues('ReviewEditor')(state),
        editorValid: isValid('ReviewEditor')(state),

        email: selector(state, 'userEmail'),
        userId: selector(state, 'userId'),

        reviews: reviewsSelector(state),
        reviewId: selectedIdSelector(state),
        editMode: editModeSelector(state),

        courses: coursesSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        closeEditor,
        insertReview,
        updateReview,
        showErrorDialog,
        raiseNotExistReviewError,
        checkUser,
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ReviewEditorWrapper)
