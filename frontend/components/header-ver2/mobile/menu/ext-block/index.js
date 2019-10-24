import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
    filterMainTypeSelector,
    filterCourseTypeSelector,
    toggleCourseTypeToFilter,
} from "ducks/filters";
import {FILTER_COURSE_TYPE} from "../../../../../constants/filters";
import "./ext-block.sass"

class ExtBlock extends React.Component {

    render() {
        const {filterCourseType, filterMainType} = this.props

        return <React.Fragment>
                <div className="mobile-menu__section ext-block">
                    {
                        filterMainType === FILTER_COURSE_TYPE.THEORY &&
                            <div className={"selector__item menu-item" + (filterCourseType.has(FILTER_COURSE_TYPE.PRACTICE) ? " active" : "")}
                                 onClick={() => {this.props.toggleCourseTypeToFilter(FILTER_COURSE_TYPE.PRACTICE)}}>
                                <span className="underlined-item">{filterCourseType.has(FILTER_COURSE_TYPE.PRACTICE) ? "- Практика" : "+ Практика"}</span>
                            </div>
                    }
                    {
                        filterMainType === FILTER_COURSE_TYPE.PRACTICE &&
                        <div className="ext-block__button ext-block__item menu-item">
                            <div className={"selector__item"  + (filterCourseType.has(FILTER_COURSE_TYPE.THEORY) ? " active" : "")}
                                 onClick={() => {this.props.toggleCourseTypeToFilter(FILTER_COURSE_TYPE.THEORY)}}>
                                <span className="underlined-item">{filterCourseType.has(FILTER_COURSE_TYPE.THEORY) ? "- Теория" : "+ Теория"}</span>
                            </div>
                        </div>
                    }</div>
                {/*<div className="mobile-menu__section ext-block">*/}
                {/*    <div className="ext-block__selector ext-block__item menu-item">*/}
                {/*        <span className="selector__item underlined-item">Курсы</span>*/}
                {/*        <span className="selector__separator"> / </span>*/}
                {/*        <span className="selector__item underlined-item">Лекции</span>*/}
                {/*    </div>*/}
                {/*</div>*/}
            </React.Fragment>
    }
}

function mapStateToProps(state) {
    return {
        filterCourseType: filterCourseTypeSelector(state),
        filterMainType: filterMainTypeSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({toggleCourseTypeToFilter,}, dispatch)
}


export default connect(mapStateToProps, mapDispatchToProps)(ExtBlock);