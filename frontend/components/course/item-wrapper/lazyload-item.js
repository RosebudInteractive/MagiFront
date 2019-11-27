import React from 'react'
import LazyLoad from 'react-lazyload';
import PropTypes from "prop-types";
import SingleLesson from "../single-lesson-course-module";
import CourseModule from "../course-module";
import ScrollMemoryStorage from "../../../tools/scroll-memory-storage"
import { forceCheck } from 'react-lazyload';
// import {filterCourseTypeSelector, filterMainTypeSelector, selectedFilterSelector} from "ducks/filters";
// import {connect} from "react-redux";

const DEFAULT_HEIGHT = 685

export default class Item extends React.Component {

    static propTypes = {
        course: PropTypes.object,
        isMobile: PropTypes.bool,
        index: PropTypes.number,
    };


    // componentDidUpdate(prevProps) {
    //     const {selectedFilter, filterMainType, filterCourseType,} = this.props;
    //
    //     const _filterChanged = !prevProps.selectedFilter.equals(selectedFilter) ||
    //         (prevProps.filterMainType !== filterMainType) ||
    //         (!prevProps.filterCourseType.equals(filterCourseType))
    //
    //     if (_filterChanged) {
    //         forceCheck()
    //     }
    // }

    componentDidMount(){
        forceCheck()
    }

    render() {
        let {course, isMobile} = this.props;

        return <LazyLoad height={this._getHeight()} once={true} unmountIfInvisible={true}>
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

// const mapStateToProps = (state) => {
//     return {
//         filterCourseType: filterCourseTypeSelector(state),
//         filterMainType: filterMainTypeSelector(state),
//         selectedFilter: selectedFilterSelector(state),
//     }
// }
//
// export default connect(mapStateToProps)(Item)