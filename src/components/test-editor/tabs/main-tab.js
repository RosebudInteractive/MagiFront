import React from 'react'
import PropTypes from "prop-types";
import {bindActionCreators} from 'redux';
import {connect} from "react-redux";
import {Field, formValueSelector, isDirty} from "redux-form";
import {TextBox} from "../../common/input-controls";
import Select from "../../common/select-control";
import RadioBox from "../../common/radio-box-control";
import {getCourseLessons} from 'adm-ducks/single-test'

const METHODS = [
        {id: 1, value: 'Последовательный'},
        {id: 2, value: 'Произвольный'},
    ],
    RADIO_BOX_VALUES = [
        {value: 1, text: "Да"},
        {value: 0, text: "Нет"},
    ]


class MainTab extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
        visible: PropTypes.bool,
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.courseId !== this.props.courseId) {
            this.props.getCourseLessons(nextProps.courseId)
        }
    }

    render() {
        const {editMode, hasChanges} = this.props;

        const _disabled = false;

        return <div className={"tab-wrapper controls-wrapper" + (this.props.visible ? '' : ' hidden')}>
            <Field component={Select} name="courseId" label="Курс" placeholder="Введите название эпизода" disabled={true}/>
            <Field component={Select} name="lessonId" label="Урок" options={this._getLessons()} disabled={_disabled}/>
            <Field component={Select} name="testTypeId" label="Вид теста" placeholder="Выберите вид теста" options={this._getTestTypes()} disabled={_disabled}/>
            <Field component={Select} name="method" label="Принцип тестирования" placeholder="Выберите способ тестирования" options={METHODS} disabled={_disabled}/>
            <Field component={TextBox} name="maxQ" label="Количеством вопросов" placeholder="Выберите максимальное количество вопросов" disabled={_disabled}/>
            <Field component={RadioBox} name="fromLesson" label="Брать вопросы из эпизодов" options={RADIO_BOX_VALUES} disabled={_disabled}/>
            <Field component={RadioBox} name="isTimeLimited" label="Ограничивать по времени" options={RADIO_BOX_VALUES} disabled={_disabled}/>
        </div>
    }

    _getLessons() {
        return this.props.courseLessons.map((lesson) => {
            return {id: lesson.id, value: lesson.Name}
        })
    }

    _getTestTypes() {

    }
}


const selector = formValueSelector('TestEditor')

const _MainTab = connect(state => {
    return {
        courseId: selector(state, 'courseId'),
    }
})(MainTab)

function mapStateToProps(state) {
    return {
        courseLessons: state.courseLessons.current,
        packageUploadProcess: state.singleEpisode.packageUploadProcess,
        hasChanges: isDirty('TestEditor')(state)
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({getCourseLessons}, dispatch)}

export default connect(mapStateToProps, mapDispatchToProps)(_MainTab)