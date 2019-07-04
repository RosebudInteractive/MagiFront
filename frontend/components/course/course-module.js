import React from 'react';
import PropTypes from 'prop-types';
import InfoBlock from './info-block';
import ImageBlock from './image-block'
import './courses-page.sass'

export default class CourseModule extends React.Component {

    static propTypes = {
        course: PropTypes.object,
        isMobile: PropTypes.bool,
    };

    render() {
        let {course, isMobile} = this.props

        return (
            (course) ?
                <div className='course-module'>
                    <InfoBlock title={course.Name}
                               url={course.URL}
                               course={course}
                               isMobile={isMobile}
                    />
                    <ImageBlock course={course}/>
                </div>
                :
                ''
        );
    }
}


