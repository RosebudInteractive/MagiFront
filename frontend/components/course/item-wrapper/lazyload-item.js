import React from 'react'
import LazyLoad from 'react-lazyload';
import PropTypes from "prop-types";
import SingleLesson from "../single-lesson-course-module";
import CourseModule from "../course-module";
import ScrollMemoryStorage from "../../../tools/scroll-memory-storage"

const DEFAULT_HEIGHT = 685

export default class Item extends React.Component {

    static propTypes = {
        course: PropTypes.object,
        isMobile: PropTypes.bool,
        index: PropTypes.number,
    };

    render() {
        let {course, isMobile} = this.props;

        return <LazyLoad height={this._getHeight()} once={true} overflow={true} unmountIfInvisible={true}>
            {
                course.OneLesson ?
                    <SingleLesson course={course} needShowAuthors={true}/>
                    :
                    <CourseModule course={course} isMobile={isMobile}/>
            }
        </LazyLoad>
    }

    _getHeight() {
        const _value = ScrollMemoryStorage.getInstance().getCourseBundleHeight(this.props.index)

        return _value ? _value : DEFAULT_HEIGHT;
    }
}