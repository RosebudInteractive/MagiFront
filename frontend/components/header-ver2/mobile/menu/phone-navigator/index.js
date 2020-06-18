import React from "react";
import {connect} from "react-redux";
import {pages} from "tools/page-tools";
import "./phone-navigator-block.sass"
import {FILTER_COURSE_TYPE} from "../../../../../constants/filters";
import {filterMainTypeSelector, setFilterCourseType} from "ducks/filters";
import {bindActionCreators} from "redux";

class PhoneUserNavigator extends React.Component {

    render() {
        const {currentPage, filterMainType} = this.props,
            _isCoursePage = currentPage === pages.courses

        return _isCoursePage && <div className='mobile-menu__section phone-navigator-block'>
            {
                _isCoursePage &&
                    <div className="menu-item__wrapper">
                        <div className={"menu-item" + (filterMainType === FILTER_COURSE_TYPE.THEORY ? ' active' : '')}
                             onClick={() => {
                                 this.props.setFilterCourseType(FILTER_COURSE_TYPE.THEORY)
                             }}>
                            <span className="underlined-item">Знания</span>
                        </div>
                    </div>
            }
            {
                _isCoursePage &&
                    <div className="menu-item__wrapper">
                        <div className={"menu-item" + (filterMainType === FILTER_COURSE_TYPE.PRACTICE ? ' active' : '')}
                             onClick={() => {
                                 this.props.setFilterCourseType(FILTER_COURSE_TYPE.PRACTICE)
                             }}>
                            <span className="underlined-item">Навыки</span>
                        </div>
                    </div>
            }
        </div>
    }
}

function mapStateToProps(state) {
    return {
        currentPage: state.pageHeader.currentPage,
        filterMainType: filterMainTypeSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({setFilterCourseType,}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(PhoneUserNavigator)
