import React from "react"
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {getCourse} from 'actions/courses-page-actions';

import {STYLES} from "../styles";
import Logo from "../components/common/logo";
import CourseCover from "../components/common/course-cover";
import Social from "../components/common/social";

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
    },
    PARAGRAPH: {
        paddingTop: "16px",
        fontFamily: "Arial",
        lineHeight: "140%",
    },
    COURSE_LINK: {
        fontStyle: "normal",
        color: "rgb(201, 100, 78)",
        display: "inline",
        textDecoration: "none"
    },
    PROMO: {
        fontWeight: "bold"
    }
}

class PurchaseCourse extends React.Component {

    constructor(props) {
        super(props)

        this.props.getCourse(this.props.courseUrl, {absPath: true});
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
                    <Logo/>
                    <CourseCover course={course}/>
                    <div>
                        <td>
                            <tr>
                                <td style={STYLE.PARAGRAPH}>
                                    {_message}
                                </td>
                            </tr>
                            <tr>
                                <td style={STYLE.PARAGRAPH}>
                                    <tr>
                                        Мы благодарим Вас за приобретение курса <a target="_blank" href={course.URL} style={STYLE.COURSE_LINK}>"Русский канон в эпоху реализма"</a>.
                                    </tr>
                                    <tr>Вы можете приступить к просмотру и чтению лекций в любое время.</tr>
                                    <tr>Для просмотра нужно быть авторизованным на Магистерии под той учетной записью, в которой Вы оплатили этот курс.</tr>
                                </td>
                            </tr>
                            <tr>
                                <td style={STYLE.PARAGRAPH}>
                                    <tr>
                                        Доступ к курсу не ограничивается по времени. Вы можете изучать его в своем ритме, прерывать прослушивание в любом месте,
                                        а также повторно прослушивать или перечитывать лекции для Вашего удовольствия или лучшего закрепления материала.
                                    </tr>
                                </td>
                            </tr>
                            <tr>
                                <td style={STYLE.PARAGRAPH}>
                                    <tr>
                                        Мы надеемся, что курс Вам понравится. И конечно же,  будем благодарны за отзывы и любую обратную связь!
                                    </tr>
                                </td>
                            </tr>
                            <tr>
                                <td style={STYLE.PARAGRAPH}>С наилучшими пожеланиями, Магистерия.</td>
                            </tr>
                        </td>
                    </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(PurchaseCourse)



