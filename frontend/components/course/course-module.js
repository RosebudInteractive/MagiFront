import React from 'react';
import PropTypes from 'prop-types';

import InfoBlock from './info-block';

export default class CourseModule extends React.Component {

    render() {
        let {course, onUrlClick, isMobile} =
            this.props;

        return (
            (course) ?
                <div className='course-module'>
                    <InfoBlock title={' ' + course.Name}
                               url={course.URL}
                               course={course}
                               onUrlClick={onUrlClick}
                               isMobile={isMobile}
                    />
                    <ImageBlock cover={course.Cover}/>
                </div>
                :
                ''
        );
    }
}

CourseModule.propTypes = {
    course: PropTypes.object.isRequired,
    onUrlClick: PropTypes.func.isRequired,
    isMobile: PropTypes.bool.isRequired,
};


class ImageBlock extends React.Component {

    render() {
        const {cover} = this.props;
        return (
            <div className='course-module__image-block'>
                <img className="course-module__image"
                     src={'/data/' + cover}
                     // srcset="assets/images/bg-lecture01@2x.png 2x"
                     width="662"
                     height="680"
                     alt=""/>
            </div>
        );
    }
}

InfoBlock.propTypes = {
    course: PropTypes.object.isRequired,
    onUrlClick: PropTypes.func.isRequired,
};