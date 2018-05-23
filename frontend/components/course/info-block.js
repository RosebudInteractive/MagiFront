import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import Info from './course-module-info';
import CourseModuleBody from './course-module-body';

export default class InfoBlock extends React.Component {

    render() {
        const {title, url, course, isMobile} = this.props;

        return (
            <div className='course-module__info-block'>
                <div className="course-module__header">
                    <span className="favourites">В закладки</span>
                    <Header title={title} url={url}/>
                    <Info authors={course ? course.AuthorsObj : []}
                          categories={course ? course.CategoriesObj : []}/>
                </div>
                <CourseModuleBody course={course} isMobile={isMobile}/>
            </div>
        );
    }
}

InfoBlock.propTypes = {
    course: PropTypes.object,
    title: PropTypes.string,
    url: PropTypes.string,
    isMobile: PropTypes.bool,
};

class Header extends React.Component {

    render() {
        return (
            <h1 className="course-module__title">
                <span className="favourites">В закладки</span>
                <Link to={'/category/' + this.props.url}>
                    <p className="course-module__label">Курс:</p>
                    <span>{this.props.title}</span>
                </Link>
            </h1>
        );
    }
}

Header.propTypes = {
    title: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
};