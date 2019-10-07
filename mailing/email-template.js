import React from "react"
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {getCourse} from '../frontend/actions/courses-page-actions';

import {STYLES} from "./styles";
import Logo from "./components/logo";
import Header from "./components/header";
import Footer from "./components/footer";
import Description from "./components/description";
import PriceButton from "./components/price-button";
import Statistic from "./components/statistic";
import Scheme from "./components/scheme";


class EmailTemplate extends React.Component {

    constructor(props) {
        super(props)

        this.props.getCourse(this.props.courseUrl, {absPath: true});
    }

    render() {
        const {fetching, course} = this.props

        return fetching || !course ?
            null
            :
            <center style={STYLES.CENTER_WRAPPER}>
                <div style={STYLES.WEBKIT}>
                    <table align="center" style={STYLES.MAIN_TABLE}>
                        <tbody>
                            <Logo/>
                            <Header course={course}/>
                            <PriceButton course={course}/>
                            <Description course={course}/>
                            <Statistic course={course}/>
                            <Scheme course={course}/>
                            <Footer course={course}/>
                        </tbody>
                    </table>
                </div>
            </center>
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

export default connect(mapStateToProps, mapDispatchToProps)(EmailTemplate)



