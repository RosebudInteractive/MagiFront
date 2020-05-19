import React from "react"
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {getCourse} from 'actions/courses-page-actions';

import {STYLES} from "../styles";
import Logo from "../components/common/logo";
import Header from "../components/common/header";
import Footer from "../components/common/footer";
import Description from "../components/description";
import PriceButton from "../components/price-button";
import Statistic from "../components/statistic";
import Scheme from "../components/scheme";
import LearnLessonButton from "../components/new-course/learn-course-button";

const STYLE = {
    COLUMN: {
        BORDER: {
            width: "24px",
            padding: 0,
            color: "#FFFFFF"
        },
        MAIN: {
            padding: 0
        }
    }
}

class NewCourse extends React.Component {

    constructor(props) {
        super(props)

        this.props.getCourse(this.props.courseUrl, {absPath: true});
    }

    render() {
        const {fetching, course} = this.props

        return fetching || !course ?
            null
            :
            <table align="center" style={STYLES.MAIN_TABLE}>
                <tbody>
                <tr>
                    <td style={STYLES.SPACE_TABLE}>&nbsp;</td>
                    <td style={STYLES.CONTENT_TABLE}>
                        <table align="center" style={STYLES.MAIN_TABLE}>
                            <tbody>
                                <Logo/>
                                <Header course={course}/>
                                <PriceButton course={course}/>
                                <Description course={course}/>
                                <Statistic course={course}/>
                                <Scheme course={course}/>
                                <LearnLessonButton course={course}/>
                                <Footer/>
                            </tbody>
                        </table>
                    </td>
                    <td style={STYLES.SPACE_TABLE}>&nbsp;</td>
                </tr>
                </tbody>
            </table>
    }
}

const mapStateToProps = (state, ownProps) => ({
    courseUrl: ownProps.match.params.courseId,
    fetching: state.singleCourse.fetching,
    notFound: state.singleCourse.notFound,
    course: state.singleCourse.object,
})

const mapDispatchToProps = dispatch => (
    bindActionCreators({getCourse}, dispatch)
)

export default connect(mapStateToProps, mapDispatchToProps)(NewCourse)



