import BaseComponent from '../base-component';
import React from 'react';
import {Counter, Wrapper} from './lecture';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

class LectureBlock extends BaseComponent {

    render() {
        let {size, width, courseIndex} = this.props;
        let _course = this.props.courses[courseIndex];
        let _lessonsCount = _course.Lessons.length;

        return (
            <div className={this._getClassName("course-module__body", 'course-body')}>
                <Counter size={size} current={1} total={_lessonsCount}/>
                <Wrapper size={size} width={width} lessons={_course.Lessons}/>
            </div>
        );
    }
}

LectureBlock.propTypes = {
    courseIndex: PropTypes.number.isRequired,
};

function mapStateToProps(state) {
    return {
        courses: state.courses.items,
    }
}

export default connect(mapStateToProps)(LectureBlock)