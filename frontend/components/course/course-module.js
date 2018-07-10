import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import InfoBlock from './info-block';
import {ImageSize, getCoverPath, getRandomInt} from '../../tools/page-tools'

export default class CourseModule extends React.Component {

    render() {
        let {course, isMobile} = this.props,
            _cover = getCoverPath(course, ImageSize.medium)

        return (
            (course) ?
                <div className='course-module'>
                    <InfoBlock title={' ' + course.Name}
                               url={course.URL}
                               course={course}
                               isMobile={isMobile}
                    />
                    <ImageBlock cover={_cover} url={course.URL} mask={course.Mask}/>
                </div>
                :
                ''
        );
    }
}

CourseModule.propTypes = {
    course: PropTypes.object,
    isMobile: PropTypes.bool,
};


class ImageBlock extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {cover, mask} = this.props;

        const _image = '<image preserveAspectRatio="xMaxYMax slice" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/data/' + cover + '" width="724" height="503"/>';

        return (
            <Link to={'/category/' + this.props.url}>
                <div className={'course-module__image-block ' + mask}>
                    <svg viewBox="0 0 574 503" width="574" height="503" dangerouslySetInnerHTML={{__html: _image}}/>
                </div>
            </Link>
        );
    }
}