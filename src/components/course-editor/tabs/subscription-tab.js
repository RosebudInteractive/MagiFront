import React from 'react'
import {connect} from "react-redux";
import {reduxForm, Field, formValueSelector, change as changeFieldValue} from 'redux-form'
import {CheckBox, TextBox,} from '../../common/input-controls'
import Select from '../../common/select-control'
import Datepicker from '../../common/date-time-control'
import PropTypes from 'prop-types'
import '../../common/form.sass'
import './subcription-tab.sass'
import {bindActionCreators} from "redux";
import moment from 'moment'
import {billingModeSelector, enableButtonsSelector} from "adm-ducks/app";
import DiscountGrid from "../grids/discounts";

const NON_CONDITIONALLY = 1,
    FREE_FOR_REG_USER = 2,
    PAID_TYPE_OPTIONS = [
        {id: NON_CONDITIONALLY, value: 'Безусловно платный'},
        {id: FREE_FOR_REG_USER, value: 'Курс с преемственностью'},
    ]

class CourseSubscriptionForm extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
        visible: PropTypes.bool,
    }

    constructor(props) {
        super(props)

        this._resizeHandler = () => {
            let _main = $('.main-area__container'),
                _rightPadding = 20;

            if (_main) {
                const _hasScrollBar = _main.get(0).scrollHeight > _main.height()
                _rightPadding = _hasScrollBar ? 20 : 2
            }

            let _discounts = window.$$('course-dyn-discounts'),
                _width = $('.editor__main-area').width() - _rightPadding

            if (_discounts) {
                _discounts.$setSize(_width, _discounts.height);
            }
        }
    }

    componentWillMount() {
        $(window).bind('resize', this._resizeHandler)
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
                    '',
                _paidRegDate = course.PaidRegDate ?
                    typeof course.PaidRegDate === 'string' ?
                        moment(new Date(course.PaidRegDate))
                        :
                        course.PaidRegDate
                    :
                    '',
                _dynDiscounts = course.DynDiscounts ? Object.entries(course.DynDiscounts).reduce((acc, [key, value]) => {
                    let _data = {Code: key, ...value}

                    _data.FirstDate = _data.FirstDate ? typeof _data.FirstDate === 'string' ?
                            moment(new Date(_data.FirstDate))
                            :
                            _data.FirstDate
                        :
                        ''

                    _data.LastDate = _data.LastDate ? typeof _data.LastDate === 'string' ?
                            moment(new Date(_data.LastDate))
                            :
                            _data.LastDate
                        :
                        ''

                    _data.id = _data.Id

                        acc.push(_data)
                        return acc
                    }, []) : []




            this.props.initialize({
                IsPaid: course.IsPaid,
                PaidTp: course.PaidTp, // 1-безусловно платный, 2-платный для зарегистрировавшихся после "PaidRegDate"
                // PaidDate: course.PaidDate, // платный с даты
                PaidRegDate: _paidRegDate, // платный для пользователей зарегистрировавшихся после
                IsSubsFree: course.IsSubsFree,
                Price: course.Price ? course.Price : '',
                DPrice: course.DPrice,
                Description: course.Discount ? course.Discount.Description : '',
                Perc: course.Discount ? course.Discount.Perc : '',
                FirstDate: _firstDate,
                LastDate: _lastDate,
                DynDiscounts: _dynDiscounts
            });
        }
    }

    componentWillUnmount() {
        this.props.reset();
        $(window).unbind('resize', this._resizeHandler)
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.visible && this.props.visible) {
            this._resizeHandler();
        }

        if (prevProps.courseSaving && !this.props.courseSaving && !this.props.courseError) {
            this.props.destroy();
            this._init()
        }

        if (prevProps.initialized && ((+prevProps.percent !== +this.props.percent) || (+prevProps.price !== +this.props.price))) {
            let _discountPrice = (this.props.percent && $.isNumeric(this.props.percent)) ? this.props.price * (1 - this.props.percent / 100) : this.props.price;

            _discountPrice = Math.trunc(_discountPrice);

            this.props.changeFieldValue('CourseSubscriptionForm', 'DPrice', _discountPrice);
        }

        if (prevProps.initialized && ((prevProps.isPaid !== this.props.isPaid) || (prevProps.paidTp !== this.props.paidTp))) {
            if ((+this.props.paidTp === FREE_FOR_REG_USER) && !this.props.paidRegDate) {
                const _date = moment(new Date())
                this.props.changeFieldValue('CourseSubscriptionForm', 'PaidRegDate', _date);
            }
        }
    }

    render() {
        let {visible, isPaid, percent, enableButtons, paidTp, billingMode} = this.props;

        const _disabled = !enableButtons,
            _isPaidForReg = +paidTp === FREE_FOR_REG_USER,
            _enableSubscription = !!billingMode.subscription

        return <div className={"form-wrapper non-webix-form" + (visible ? '' : ' hidden')}>
            <form className="controls-wrapper course-subscription-tab" action={"javascript:void(0)"}>
                <Field component={CheckBox} name="IsPaid" label="Платный" disabled={_disabled}/>
                <Field component={Select} name="PaidTp" label="Тип платности" placeholder="Выберите тип" disabled={_disabled || !isPaid} options={PAID_TYPE_OPTIONS}/>
                <Field component={Datepicker} name="PaidRegDate" label="Платный для зарегистрировавшихся после" showTime={true} hidden={!_isPaidForReg || !isPaid} disabled={_disabled}/>
                <Field component={CheckBox} name="IsSubsFree" label="Бесплатный в рамках подписки" disabled={_disabled || !_enableSubscription}/>
                <Field component={TextBox} name="Price" label="Цена" placeholder="Введите цену" disabled={!isPaid || _disabled}/>
                <Field component={TextBox} name="DPrice" label="Цена со скидкой" placeholder="Введите цену" disabled={true}/>
                <div className="group-box">
                    <div className="group-box__title">Скидка</div>
                    <Field component={TextBox} name="Description" label="Описание скидки" placeholder="Введите описание" disabled={!percent || !isPaid || _disabled}/>
                    <div className="discount-percent__wrapper">
                        <Field component={TextBox} name="Perc" label="Процент скидки" placeholder="Введите значение" disabled={!isPaid || _disabled}/>
                        <button className='tool-btn del discount-percent__button' onClick={::this._clearDiscount} disabled={!isPaid || !percent || _disabled}/>
                    </div>
                    <Field component={Datepicker} name="FirstDate" label="Начало действия" disabled={!percent || !isPaid || _disabled}/>
                    <Field component={Datepicker} name="LastDate" label="Окончание действия" disabled={!percent || !isPaid || _disabled}/>
                </div>
                <Field component={DiscountGrid} name="DynDiscounts" editMode={this.props.editMode}/>
            </form>
        </div>
    }

    _clearDiscount(e) {
        e.preventDefault();

        this.props.changeFieldValue('CourseSubscriptionForm', 'Perc', null);
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

        if (values.PaidTp === FREE_FOR_REG_USER) {
            if (!values.PaidRegDate) {
                errors.PaidRegDate = 'Значение не может быть пустым'
            }
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
        paidTp: selector(state, 'PaidTp'),
        paidRegDate: selector(state, 'PaidRegDate'),
    }
})(CourseSubscriptionWrapper)

function mapStateToProps(state) {
    return {
        course: state.singleCourse.current,
        courseSaving: state.singleCourse.saving,
        courseError: state.singleCourse.error,
        enableButtons: enableButtonsSelector(state),
        billingMode: billingModeSelector(state)
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({changeFieldValue}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CourseSubscriptionWrapper)
