import React from 'react';
import PropTypes from 'prop-types';
import Info from '../../course/course-module-info';
import PriceBlock from "../../common/price-block";

export default class Header extends React.Component {

    static propTypes = {
        authors: PropTypes.array,
        categories: PropTypes.array,
        course: PropTypes.object,
    }

    render() {
        return (
            <div className="course-module__header">
                <Info authors={this.props.authors} categories={this.props.categories} showPhoto={true}/>
                <PriceBlock course={this.props.course}/>
            </div>
        )
    }
}