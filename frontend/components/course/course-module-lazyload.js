import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import InfoBlock from './info-block';
import {ImageSize, getCoverPath} from '../../tools/page-tools';
import {lazyload} from 'react-lazyload';

@lazyload({
    height: 200,
    once: true,
    offset: 100,
    unmountIfInvisible: true,
})
export default class CourseModuleLazyload extends React.Component {

    render() {
        let {course, isMobile} = this.props,
            _cover = getCoverPath(course, ImageSize.medium),
            _size = course.CoverMeta.size;

        return (
            (course) ?
                <div className='course-module'>
                    <InfoBlock title={' ' + course.Name}
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

CourseModuleLazyload.propTypes = {
    course: PropTypes.object,
    isMobile: PropTypes.bool,
};


class ImageBlock extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {cover, mask, size} = this.props;
        let _width = size ? size.width : 574,
            _height = size ? size.height : 503;

        // if (_height < 503) {
        // let _ratio = 503 / _height,
        //     _newWidth = _width * _ratio,
        //     _deltaX = Math.round((_width - _newWidth) / 2);
        //
        // _width = _newWidth;
        // _height = 503;
        // }
        _width = 574;
        _height = 503;
        let _deltaX = 0;

        const _image = '<image preserveAspectRatio="xMidYMid slice" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/data/' + cover + '" x="' + _deltaX + '" width="' + _width + '" height="' + _height + '"/>';

        return (
            <Link to={'/category/' + this.props.url}>
                <div className={'course-module__image-block ' + mask}>
                    <svg viewBox="0 0 574 503" width="574" height="503" dangerouslySetInnerHTML={{__html: _image}}/>
                </div>
            </Link>
        );
    }
}