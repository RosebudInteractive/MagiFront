import React from "react";
import {Link} from "react-router-dom";
import {connect} from "react-redux";
import {pages} from "tools/page-tools";
import "./phone-navigator-block.sass"
import {FILTER_COURSE_TYPE} from "../../../../../constants/filters";
import {filterMainTypeSelector, setFilterCourseType} from "ducks/filters";
import {bindActionCreators} from "redux";

class PhoneUserNavigator extends React.Component {

    render() {
        const HISTORY = '<use xlink:href="#history"/>'

        const {authorized, currentPage, filterMainType} = this.props,
            _isCoursePage = currentPage === pages.courses

        return (_isCoursePage || authorized) && <div className='mobile-menu__section phone-navigator-block'>
            {
                _isCoursePage &&
                    <div className="menu-item__wrapper">
                        <div className={"menu-item" + (filterMainType === FILTER_COURSE_TYPE.THEORY ? ' active' : '')}
                             onClick={() => {
                                 this.props.setFilterCourseType(FILTER_COURSE_TYPE.THEORY)
                             }}>
                            <span className="underlined-item">Теория</span>
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
                            <span className="underlined-item">Практика</span>
                        </div>
                    </div>
            }
            {
                authorized &&
                    <Link to={'/history'} className="menu-item__wrapper">
                        <svg width="16" height="16" dangerouslySetInnerHTML={{__html: HISTORY}}/>
                        <div
                            className={"menu-item history-item" + (currentPage === pages.history ? ' active' : '')}>
                            <span className="underlined-item">История</span>
                        </div>
                    </Link>
            }
        </div>
    }
}

function mapStateToProps(state) {
    return {
        authorized: !!state.user.user,
        currentPage: state.pageHeader.currentPage,
        filterMainType: filterMainTypeSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({setFilterCourseType}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(PhoneUserNavigator)