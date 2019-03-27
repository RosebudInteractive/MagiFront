import React from 'react'
import {Field, formValueSelector,} from 'redux-form'
import {CheckBox, TextBox} from "../../common/input-controls";
import TextArea from "../../common/text-area";
import Datepicker from "../../common/date-time-control";
import Cover from "../../common/cover-control";
import PropTypes from "prop-types";
import Select from "../../common/select-control";
import {connect} from "react-redux";
import {fixedLessonIdSelector, fixedObjDescrSelector, parametersFetchingSelector} from "adm-ducks/params";

const LESSON_TYPES = [
        {id: 'L', value: 'Лекция'},
    ],
    LESSON_STATE = [
        {id: 'D', value: 'Черновик'},
        {id: 'R', value: 'Готовый'},
        {id: 'A', value: 'Архив'}
    ]


class MainTab extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
        visible: PropTypes.bool,
    }

    render() {
        let { lesson, fixedLessonId, fixDescription, } = this.props,
            _fixed = (lesson && (lesson.id === fixedLessonId)),
            _fixDescription = _fixed ? fixDescription : ''

        return <div className={"tab-wrapper controls-wrapper" + (this.props.visible ? '' : ' hidden')}>
            <Field component={TextBox} name="courseName" label="Курс" disabled={true}/>
            <Field component={TextBox} name="number" label="Номер урока" disabled={true}/>
            <Field component={Select} name="lessonType" label="Тип урока" placeholder="Выберите тип урока"
                   options={LESSON_TYPES}/>
            <Field component={TextBox} name="name" label="Название урока" placeholder="Введите название урока(лекции)"/>
            <Field component={TextBox} name="URL" label="URL" placeholder="Введите URL"/>
            <Field component={Select} name="authorId" label="Автор" placeholder="Выберите автора"
                   options={this._getCourseAuthors()}/>
            <Field component={Cover} name="cover" label="Обложка лекции"/>
            <Field component={Select} name="state" label="Состояние" placeholder="Выберите состояние"
                   options={LESSON_STATE}/>
            <Field component={Datepicker} name="readyDate" label="Планируемая дата публикации"/>
            <Field component={TextArea} name="description" label="Краткое описание" enableHtml={false}/>
            <Field component={TextArea} name="extLinksValues" label="Ссылки на другие ресурсы" enableHtml={false}/>
            <Field component={CheckBox} name="fixed" label="Зафиксировать лекцию"/>
            <Field component={TextArea} enableHtml={true} name="fixDescription" label="Описание" hidden={!this.props.isFixedActive}
                   value={_fixDescription}/>
        </div>
    }

    _getCourseAuthors() {
        return this.props.authors.map((elem) => {
            return {id: elem.id, value: elem.FirstName + ' ' + elem.LastName};
        })
    }
}

const selector = formValueSelector('LessonEditor')

const _MainTab = connect(state => {
    return {
        isFixedActive: selector(state, 'fixed'),
    }
})(MainTab)

function mapStateToProps(state) {
    return {
        authors: state.courseAuthorsList.authors,
        lesson: state.singleLesson.current,
        fixedLessonId: fixedLessonIdSelector(state),
        fixDescription: fixedObjDescrSelector(state),
    }
}

export default connect(mapStateToProps,)(_MainTab)