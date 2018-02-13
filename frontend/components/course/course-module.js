import React from 'react';
import PropTypes from 'prop-types';

import InfoBlock from './info-block';
import * as svg from '../../tools/svg-paths';

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
        const _image = '<image xlink:href="/data/' + cover + '"/>';

        return (
            <div className='course-module__image-block _mask02'>
                <svg viewBox="0 0 574 503" width="574" height="503" dangerouslySetInnerHTML={{ __html: _image }}/>
            </div>
        );
    }
}

InfoBlock.propTypes = {
    course: PropTypes.object.isRequired,
    onUrlClick: PropTypes.func.isRequired,
};