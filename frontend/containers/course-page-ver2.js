import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import MetaTags from 'react-meta-tags';
import {pages} from "../tools/page-tools";
import {whoAmI} from "actions/user-actions";
import {refreshState} from "actions/lesson-info-storage-actions";
import {setCurrentPage} from "actions/page-header-actions";
import {getCourse} from "actions/courses-page-actions";
import $ from "jquery";
import Wrapper from "../components/course-page/index";


class CoursePage extends React.Component {

    constructor(props) {
        super(props)

        $('body').addClass('course-page-ver2').addClass('_transparent-menu')
    }

    componentWillMount() {
        window.scrollTo(0, 0)
        this.props.whoAmI()
        this.props.refreshState();
        this.props.getCourse(this.props.courseUrl);
        this.props.setCurrentPage(pages.singleCourse);
    }

    componentWillUnmount() {
        $('body').removeClass('course-page-ver2').removeClass('_transparent-menu')
    }

    render() {
        return <div className={"course-page-ver2"}>
            <Wrapper/>
        </div>
    }
}

function mapStateToProps(state, ownProps) {

}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({whoAmI, refreshState, getCourse, setCurrentPage}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(CoursePage)