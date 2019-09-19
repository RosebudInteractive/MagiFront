import React from 'react'
import PropTypes from 'prop-types'
import Statistic from './statistic'
import CourseWrapper from './course-wrapper'
import './content.sass'
import PageHeader from "../../page-header/page-header";

export default class Content extends React.Component {

    static propTypes = {
        course: PropTypes.object,
        shareUrl: PropTypes.string
    }

    constructor(props) {
        super(props)
    }

    render() {
        return <div className="course-page__content">
            <PageHeader visible={true}/>
            <Statistic course={this.props.course} shareUrl={this.props.shareUrl}/>
            <CourseWrapper course={this.props.course}/>
        </div>
    }
}