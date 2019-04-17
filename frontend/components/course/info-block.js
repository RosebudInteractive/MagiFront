import React from 'react';
import PropTypes from 'prop-types';
import Info from './course-module-info';
import CourseModuleBody from './course-module-body';
import Header from './header'
import PriceBlock from '../common/price-block'

export default class InfoBlock extends React.Component {

    static propTypes = {
        course: PropTypes.object,
        title: PropTypes.string,
        url: PropTypes.string,
        isMobile: PropTypes.bool,
    };

    render() {
        const {title, url, course, isMobile} = this.props;

        return (
            <div className='course-module__info-block'>
                <div className="course-module__header">
                    <Header title={title} url={url} course={course}/>
                    <Info authors={course ? course.AuthorsObj : []}
                          categories={course ? course.CategoriesObj : []}/>
                    <PriceBlock course={course}/>
                </div>
                <CourseModuleBody course={course} isMobile={isMobile}/>
            </div>
        );
    }
}