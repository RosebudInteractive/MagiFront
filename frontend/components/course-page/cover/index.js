import React from 'react'
import PropTypes from 'prop-types'
import './cover.sass'
import {Link} from "react-router-dom";

const COURSE_PAGE_INFO_SEPARATOR = <span className="course-page__info-separator">•</span>

export default class Menu extends React.Component {

    static propTypes = {
        course: PropTypes.object
    }

    constructor(props) {
        super(props)
    }

    render() {
        const {course} = this.props,
            _coverStyle = {backgroundImage : "url(" + '/data/' + course.Cover + ")"}

        return <div className="course-page__cover" style={_coverStyle}>
            <div className="course-page__info-wrapper">
                <div className="course-page__favorite-button"/>
                <div className="course-page__info">

                    <h1 className="info__title">
                        <p className="title__label">Курс:</p>
                        <span>{course.Name}</span>
                    </h1>
                    <div className="info__authors-and-category">
                        <div className="info__authors">{this._getAuthorBlock()}</div>
                        <div className="info__categories">{this._getCategoriesBlock()}</div>
                    </div>
                </div>
            </div>
        </div>
    }

    _getAuthorBlock(){
        return this.props.course.Authors.map((author, index) => {
            let _authorName = author.FirstName + ' ' + author.LastName;

            return (<React.Fragment>
                <Link to={'/autor/' + author.URL} className="author-item" key={index}>{_authorName}</Link>
                {COURSE_PAGE_INFO_SEPARATOR}
            </React.Fragment>);
        });
    }

    _getCategoriesBlock() {
        return this.props.course.Categories.map((item, index, array) => {
            let _isLast = (index === array.length - 1);
            return (<React.Fragment>
                <span className="category-item" key={index}>{item.Name.toUpperCase()}</span>
                {_isLast ? null : COURSE_PAGE_INFO_SEPARATOR}
            </React.Fragment>);
        });
    }
}