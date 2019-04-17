import React from "react";
import PropTypes from "prop-types"

export default class LessonsTab extends React.Component {

    static propTypes = {
        total: PropTypes.number,
        ready: PropTypes.number,
        active: PropTypes.bool
    }

    render() {
        return (
            <li className={'course-tab-control' + (this.props.active ? ' active' : '')}>
                <span className="course-tab-control__title">Лекции</span>
                <span className="course-tab-control__label">Вышло</span>
                <span className="course-tab-control__actual">{this.props.ready}</span>
                <span className="course-tab-control__total">/{this.props.total}</span>
            </li>
        )
    }
}