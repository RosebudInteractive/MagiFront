import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import Info from './course-module-info';
import CourseModuleBody from './course-module-body';

export default class InfoBlock extends React.Component {

    render() {
        const {title, url, course, isMobile} = this.props;

        return (
            <div className='course-module__info-block'>
                <div className="course-module__header">
                    <Header title={title} url={url}/>
                    <Info authors={course ? course.AuthorsObj:[]}
                          categories={course ? course.CategoriesObj:[]}/>
                </div>
                <CourseModuleBody course={course} isMobile={isMobile}/>
            </div>
        );
    }
}

InfoBlock.propTypes = {
    course: PropTypes.object.isRequired,
    title: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    isMobile: PropTypes.bool.isRequired,
};

class Header extends React.Component {

    render() {
        return (
            <h1 className="course-module__title">
                <p className="course-module__label">Курс:</p>
                <span><Link to={'/category/' + this.props.url}>{this.props.title}</Link></span>
            </h1>
        );
    }
}

Header.propTypes = {
    title: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
};