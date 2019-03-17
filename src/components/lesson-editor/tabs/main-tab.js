import React from 'react'
import {Field,} from 'redux-form'
import {TextBox} from "../../common/input-controls";
import TextArea from "../../common/text-area";
import Cover from "../../common/cover-control";
import PropTypes from "prop-types";
import Select from "../../common/select-control";
import {connect} from "react-redux";

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
            <Field component={TextArea} name="description" label="Краткое описание" enableHtml={false}/>
            <Field component={TextArea} name="extLinksValues" label="Ссылки на другие ресурсы" enableHtml={false}/>
        </div>
    }

    _getCourseAuthors() {
        return this.props.authors.map((elem) => {
            return {id: elem.id, value: elem.FirstName + ' ' + elem.LastName};
        })
    }
}

function mapStateToProps(state) {
    return {
        authors: state.courseAuthorsList.authors,
    }
}

export default connect(mapStateToProps,)(MainTab)