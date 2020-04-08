import React from "react"
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {getCourse} from 'actions/courses-page-actions';

import {STYLES} from "../styles";
import Logo from "../components/common/logo";
import CourseCover from "../components/common/course-cover";
import Social from "../components/common/social";
import PromoInstruction from "../components/purchase-promo/instruction";

const STYLE = {
    GREETING: {
        paddingTop: "30px",
        fontFamily: "Arial",
        fontSize: "23px",
        fontWeight: "bold",
        lineHeight: "130%",
    },
    PARAGRAPH: {
        THANKSGIVING: {
            paddingTop: "12px",
            fontFamily: "Arial",
            fontSize: "18px",
            fontWeight: "normal",
            lineHeight: "130%",
        },
        COMMON: {
            paddingTop: "15px",
            fontFamily: "Arial",
            fontSize: "17px",
            lineHeight: "130%",
        },
        LAST: {
            paddingTop: "15px",
            paddingBottom: "35px",
            fontFamily: "Arial",
            fontSize: "17px",
            lineHeight: "130%",
        },
    },
    LINK: {
        fontStyle: "normal",
        color: "#C8684C",
        display: "inline",
        textDecoration: "none"
    },

}

class PurchasePromo extends React.Component {

    constructor(props) {
        super(props)

        this.props.getCourse(this.props.courseUrl, {absPath: true});
    }

    render() {
        const {fetching, course} = this.props

        const _params = new URLSearchParams(this.props.location.search),
            _userName = _params.get('username'),
            _promo = _params.get('promo'),
            _message = "Здравствуйте" + (_userName ? `, ${_userName}!` : "!")

        return fetching || !course ?
            null
            :
            <table align="center" style={STYLES.MAIN_TABLE}>
                <tbody>
                    <Logo/>
                    <CourseCover course={course}/>
                    <tr>
                        <td style={STYLE.GREETING}>
                            {_message}
                        </td>
                    </tr>
                    <tr>
                        <td style={STYLE.PARAGRAPH.THANKSGIVING}>
                            Благодарим Вас за покупку подарочного промокода на курс {course.Name}.
                        </td>
                    </tr>
                    <tr>
                        <td style={STYLE.PARAGRAPH.COMMON}>Вы можете просто переслать указанный ниже промокод вместе с инструкцией активации человеку, которому планируете подарить его.</td>
                    </tr>
                    <PromoInstruction URL={course.URL} name={course.Name} promo={_promo}/>
                    <tr><td style={STYLE.PARAGRAPH.COMMON}>Также уточняем, что промокод может быть применен только один раз и только для данного курса.</td></tr>
                    <tr>
                        <td style={STYLE.PARAGRAPH.LAST}>С наилучшими пожеланиями, Магистерия.</td>
                    </tr>
                    <Social/>
                </tbody>
            </table>
    }
}

const mapStateToProps = (state, ownProps) => ({
    courseUrl: ownProps.match.params.courseId,
    fetching: state.singleCourse.fetching,
    notFound: state.singleCourse.notFound,
    course: state.singleCourse.object,
    ownProps
})

const mapDispatchToProps = dispatch => (
    bindActionCreators({getCourse}, dispatch)
)

export default connect(mapStateToProps, mapDispatchToProps)(PurchasePromo)



