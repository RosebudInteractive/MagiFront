import React from 'react'
import PropTypes from "prop-types";
import Aggregators from '../aggregators/one-line-aggregators'

export default class LessonAggregators extends React.Component {

    static propTypes = {
        extLinks: PropTypes.object,
    }

    render() {
        return this.props.extLinks ?
            <div className="lecture-info__wrapper">
                <div className='lesson-aggregators other-sources'>
                    <div className="aggregator-list_title">Лекция на других ресурсах</div>
                    <Aggregators extLinks={this.props.extLinks}/>
                </div>
            </div>
            :
            null

    }
}