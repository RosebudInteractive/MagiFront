import React from 'react'
import {connect} from "react-redux";
import {reduxForm, Field, formValueSelector, change as changeFieldValue} from 'redux-form'
import {CheckBox, TextBox,} from '../../common/input-controls'
import Datepicker from '../../common/date-time-control'
import PropTypes from 'prop-types'
import '../../common/form.sass'
import {bindActionCreators} from "redux";
import moment from 'moment'
import {enableButtonsSelector} from "adm-ducks/app";

class CourseSubscriptionForm extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
        visible: PropTypes.bool,
    }

    componentDidMount() {
        this._init()
    }

    _init() {
        let {course,} = this.props

        if (course) {
            let _firstDate = course.Discount && course.Discount.FirstDate ?
                typeof course.Discount.FirstDate === 'string' ?
                    moment(new Date(course.Discount.FirstDate))
                    :
                    course.Discount.FirstDate
                :
                '',
                _lastDate = course.Discount && course.Discount.LastDate ?
                    typeof course.Discount.LastDate === 'string' ?
                        moment(new Date(course.Discount.LastDate))
                        :
                        course.Discount.LastDate
                    :
                    ''


            this.props.initialize({
                IsPaid: course.IsPaid,
                IsSubsFree: course.IsSubsFree,
                Price: course.Price ? course.Price : '',
                DPrice: course.DPrice,
                Description: course.Discount ? course.Discount.Description : '',
                Perc: course.Discount ? course.Discount.Perc : '',
                FirstDate: _firstDate,
                LastDate: _lastDate,
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

        if ((+prevProps.percent !== +this.props.percent) || (+prevProps.price !== +this.props.price)) {
            let _discountPrice = (this.props.percent && $.isNumeric(this.props.percent)) ? this.props.price * (1 - this.props.percent / 100) : this.props.price;

            _discountPrice = Math.trunc(_discountPrice);

            this.props.changeFieldValue('CourseSubscriptionForm', 'DPrice', _discountPrice);
        }
    }

    render() {
        let {visible, isPaid, percent, enableButtons} = this.props;

        let _disabled = !enableButtons;

        return <div className={"form-wrapper non-webix-form" + (visible ? '' : ' hidden')}>
            <form className="controls-wrapper">
                <Field component={CheckBox} name="IsPaid" label="Платный" disabled={_disabled}/>
                <Field component={CheckBox} name="IsSubsFree" label="Бесплатный в рамках подписки" disabled={_disabled}/>
                <Field component={TextBox} name="Price" label="Цена" placeholder="Введите цену" disabled={!isPaid || _disabled}/>
                <Field component={TextBox} name="DPrice" label="Цена со скидкой" placeholder="Введите цену"
                       disabled={true}/>
                <div className="group-box">
                    <div className="group-box__title">Скидка</div>
                    <Field component={TextBox} name="Description" label="Описание скидки" placeholder="Введите описание"
                           disabled={!percent || !isPaid || _disabled}/>
                    <Field component={TextBox} name="Perc" label="Процент скидки" placeholder="Введите значение"
                           disabled={!isPaid || _disabled}/>
                    <Field component={Datepicker} name="FirstDate" label="Начало действия"
                           disabled={!percent || !isPaid || _disabled}/>
                    <Field component={Datepicker} name="LastDate" label="Окончание действия"
                           disabled={!percent || !isPaid || _disabled}/>
                </div>
            </form>
        </div>
    }
}

const validate = (values) => {

    const errors = {}

    if (values.IsPaid) {
        if (!$.isNumeric(values.Price)) {
            errors.Price = 'Значение должно быть числовым'
        } else if (!values.Price || !+values.Price) {
            errors.Price = 'Значение не может быть пустым'
        }

        if (values.Perc) {
            if (!$.isNumeric(values.Perc)) {
                errors.Perc = 'Значение должно быть числовым'
            }

            if (values.Perc >= 100) {
                errors.Perc = 'Скидка не может быть 100% или более'
            }

            if (!values.FirstDate) {
                errors.FirstDate = 'Значение не может быть пустым'
            }

            if (!values.LastDate) {
                errors.LastDate = 'Значение не может быть пустым'
            }

            if (values.FirstDate && values.LastDate && (values.FirstDate.isSameOrAfter(values.LastDate))) {
                errors.LastDate = 'Дата окончания должна быть больше даты начала'
            }

        }
    }

    return errors
}

let CourseSubscriptionWrapper = reduxForm({
    form: 'CourseSubscriptionForm',
    validate,
})(CourseSubscriptionForm);

const selector = formValueSelector('CourseSubscriptionForm')

CourseSubscriptionWrapper = connect(state => {
    return {
        isPaid: selector(state, 'IsPaid'),
        price: selector(state, 'Price'),
        percent: selector(state, 'Perc'),
    }
})(CourseSubscriptionWrapper)

function mapStateToProps(state) {
    return {
        course: state.singleCourse.current,
        courseSaving: state.singleCourse.saving,
        courseError: state.singleCourse.error,
        enableButtons: enableButtonsSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({changeFieldValue}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CourseSubscriptionWrapper)