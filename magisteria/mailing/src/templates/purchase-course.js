import React from "react"
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {getCourse} from 'actions/courses-page-actions';

import {STYLES} from "../styles";
import Logo from "../components/common/logo";
import CourseCover from "../components/common/course-cover";
import Social from "../components/common/social";
import CourseDiscountBlock from "../components/course-discount-block";
import "../components/common/common.sass"
import {loadingSelector, discountSelector, getCourseDiscounts} from "ducks/course"

const STYLE = {
    TEXT: {
        fontFamily: "Arial",
        fontSize: "18px",
        lineHeight: "130%",
    },
}

class PurchaseCourse extends React.Component {

    constructor(props) {
        super(props)

        this.props.getCourse(this.props.courseUrl, {abs_path: true});
        this.props.getCourseDiscounts();
    }

    render() {
        const {fetching, course} = this.props

        const _params = new URLSearchParams(this.props.location.search),
            _userName = _params.get('username'),
            _message = "Здравствуйте" + (_userName ? `, ${_userName}!` : "!")

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
                                <CourseCover course={course}/>
                                <tr>
                                    <td>
                                        <tr>
                                            <td style={STYLES.PARAGRAPH.GREETING}>
                                                {_message}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={STYLES.PARAGRAPH.THANKSGIVING}>
                                                Мы благодарим Вас за приобретение курса <a target="_blank" href={course.URL} style={STYLES.LINK}>"{course.Name}"</a>.
                                            </td>
                                        </tr>
                                        <tr><td style={STYLES.PARAGRAPH.COMMON}>Вы можете приступить к просмотру и чтению лекций в любое время.</td></tr>
                                        <tr><td style={STYLE.TEXT}>Для просмотра авторизуйтесь на Магистерии под той учетной записью, в которой Вы оплатили этот курс.</td></tr>
                                        <CourseDiscountBlock searchParams={this.props.location.search} discounts={this.props.discounts}/>
                                        <tr>
                                            <td style={STYLES.PARAGRAPH.COMMON}>
                                                Доступ к курсу не ограничивается по времени. Вы можете изучать его в своем ритме, прерывать прослушивание в любом месте,
                                                а также повторно прослушивать или перечитывать лекции для Вашего удовольствия или лучшего закрепления материала.
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={STYLES.PARAGRAPH.LAST}>
                                                Мы надеемся, что курс Вам понравится. И конечно же, будем благодарны за отзывы и любую обратную связь!
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={STYLES.PARAGRAPH.LAST}>С наилучшими пожеланиями, Магистерия.</td>
                                        </tr>
                                    </td>
                                </tr>
                                <Social/>
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
    fetching: state.singleCourse.fetching || loadingSelector(state),
    notFound: state.singleCourse.notFound,
    course: state.singleCourse.object,
    discounts: discountSelector(state),
    ownProps
})

const mapDispatchToProps = dispatch => (
    bindActionCreators({getCourse, getCourseDiscounts}, dispatch)
)

export default connect(mapStateToProps, mapDispatchToProps)(PurchaseCourse)



