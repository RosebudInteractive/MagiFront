import React from "react";
import {connect} from "react-redux";
import {pages} from "tools/page-tools";
import {filterMainTypeSelector, setFilterCourseType} from "ducks/filters";
import {FILTER_COURSE_TYPE} from "../../../../constants/filters";
import {bindActionCreators} from "redux";

class FilterBlock extends React.Component {

    render() {
        const {currentPage, filterMainType} = this.props,
            _isCoursePage = currentPage === pages.courses

        return _isCoursePage &&
            <React.Fragment>
                <li className={"header-menu__item" + (filterMainType === FILTER_COURSE_TYPE.THEORY ? ' active' : '')}
                    onClick={() => {this.props.setFilterCourseType(FILTER_COURSE_TYPE.THEORY)}}>
                    <span className="item__title">Теория</span>
                </li>
                <li className={"header-menu__item" + (filterMainType === FILTER_COURSE_TYPE.PRACTICE ? ' active' : '')}
                    onClick={() => {this.props.setFilterCourseType(FILTER_COURSE_TYPE.PRACTICE)}}>
                    <span className="item__title">Практика</span>
                </li>
            </React.Fragment>
    }
}

function mapStateToProps(state) {
    return {
        currentPage: state.pageHeader.currentPage,
        filterMainType: filterMainTypeSelector(state)
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({setFilterCourseType}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(FilterBlock)