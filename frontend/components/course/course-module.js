import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import InfoBlock from './info-block';
import {ImageSize, getCoverPath} from '../../tools/page-tools';

export default class CourseModule extends React.Component {

    static propTypes = {
        course: PropTypes.object,
        isMobile: PropTypes.bool,
    };

    render() {
        let {course, isMobile} = this.props,
            _cover = getCoverPath(course, ImageSize.medium),
            _size = course.CoverMeta.size;

        return (
            (course) ?
                <div className='course-module'>
                    <InfoBlock title={course.Name}
                               url={course.URL}
                               course={course}
                               isMobile={isMobile}
                    />
                    <ImageBlock cover={_cover} url={course.URL} mask={course.Mask} size={_size}/>
                </div>
                :
                ''
        );
    }
}


class ImageBlock extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {cover, mask,} = this.props,
            _image = '<image preserveAspectRatio="xMidYMid slice" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/data/' + cover + '" x="0" width="574" height="503"/>';

        return (
            <Link to={'/category/' + this.props.url}>
                <div className={'course-module__image-block ' + mask}>
                    <svg viewBox="0 0 574 503" width="574" height="503" dangerouslySetInnerHTML={{__html: _image}}/>
                </div>
            </Link>
        );
    }
}