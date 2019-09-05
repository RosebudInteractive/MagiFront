import React from 'react'
import PropTypes from 'prop-types'
import './course-wrapper.sass'
import ExtendedInfo from "./extended-info";
import Scheme from "./scheme";
import CourseBooksList from "../../../books/course-books-list";
import Books from "../../../books";

export default class CourseWrapper extends React.Component {

    static propTypes = {
        course: PropTypes.object
    }

    constructor(props) {
        super(props)

        this.state = {
            showMore: false
        }
    }

    render() {
        const {course} = this.props

        return <div className="course-page__course-wrapper">
            <div className="course-wrapper__short-description">{course.ShortDescription}</div>
            <div className="course-wrapper__more-button">
                <span onClick={::this._switchShowMore}>{this.state.showMore ? "Скрыть информацию" : "Вся информация о курсе"}</span>
                {this.state.showMore ? " ↑ " : " ↓ "}
            </div>
            <ExtendedInfo course={course} visible={this.state.showMore}/>
            <Scheme course={course}/>
            <Books books={this.props.course.Books}
                   titleClassName={"course-wrapper__title"}
                   listClass={CourseBooksList}
                   extClass={"course-page__books"}
                   title={"Курс в виде книги"}/>
            {/*<div className="course-wrapper__about">*/}
            {/*    <div className="course-wrapper__about-title">О магистерии</div>*/}
            {/*    Истина, полагает он, начинается с отказа от заблуждения. Поэтому в начале своего трактата "О душе" он*/}
            {/*    последовательно излагает, а затем критикует все основные распространенные в его время учения о природе*/}
            {/*    души. Уже в этом обзоре и в этой критике ярко выступает эмпирический характер психологии Аристотеля,*/}
            {/*    его убеждение в тесной связи между душевными и телесными явлениями.*/}
            {/*</div>*/}
        </div>
    }

    _switchShowMore() {
        this.setState({
            showMore: !this.state.showMore
        })
    }
}