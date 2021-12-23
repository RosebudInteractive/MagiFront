import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
    filterMainTypeSelector,
    filterCourseTypeSelector,
    toggleCourseTypeToFilter,
} from "ducks/filters";
import {hideMenu} from "actions/page-header-actions";
import {FILTER_COURSE_TYPE} from "../../../../../constants/filters";
import "./ext-block.sass"
import {OverflowHandler} from "tools/page-tools";

class ExtBlock extends React.Component {

    render() {
        const {filterCourseType, filterMainType} = this.props

        return <React.Fragment>
                <div className="mobile-menu__section ext-block">
                    {
                        filterMainType === FILTER_COURSE_TYPE.THEORY &&
                            <div className={"selector__item menu-item" + (filterCourseType.has(FILTER_COURSE_TYPE.PRACTICE) ? " active" : "")}
                                 onClick={() => {this._toggle(FILTER_COURSE_TYPE.PRACTICE)}}>
                                <span className="underlined-item">{filterCourseType.has(FILTER_COURSE_TYPE.PRACTICE) ? "- Навыки" : "+ Навыки"}</span>
                            </div>
                    }
                    {
                        filterMainType === FILTER_COURSE_TYPE.PRACTICE &&
                        <div className="ext-block__button ext-block__item menu-item">
                            <div className={"selector__item"  + (filterCourseType.has(FILTER_COURSE_TYPE.THEORY) ? " active" : "")}
                                 onClick={() => {this._toggle(FILTER_COURSE_TYPE.THEORY)}}>
                                <span className="underlined-item">{filterCourseType.has(FILTER_COURSE_TYPE.THEORY) ? "- Знания" : "+ Знания"}</span>
                            </div>
                        </div>
                    }</div>
            </React.Fragment>
    }

    _toggle(value) {
        this.props.toggleCourseTypeToFilter(value)

        this.props.hideMenu()
        OverflowHandler.turnOff();
    }
}

function mapStateToProps(state) {
    return {
        filterCourseType: filterCourseTypeSelector(state),
        filterMainType: filterMainTypeSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({toggleCourseTypeToFilter, hideMenu}, dispatch)
}


export default connect(mapStateToProps, mapDispatchToProps)(ExtBlock);