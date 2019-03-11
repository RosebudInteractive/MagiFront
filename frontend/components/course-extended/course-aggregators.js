import React from 'react'
import PropTypes from "prop-types";
import Aggregators from '../aggregators/aggregators'

export default class CourseAggregators extends React.Component {

    static propTypes = {
        extLinks: PropTypes.object,
    }

    render() {
        return this.props.extLinks ?
            <div className='course-aggregators'>
                <div className="aggregator-list_title">Курс на других ресурсах</div>
                <Aggregators extLinks={this.props.extLinks}/>
            </div>
            :
            null

    }
}