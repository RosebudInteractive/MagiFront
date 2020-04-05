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
                        <td style={STYLE.PARAGRAPH}>
                            {_message}
                        </td>
                    </tr>
                    <tr>
                        <td style={STYLE.PARAGRAPH}>
                            Благодарим Вас за покупку подарочного промокода на курс <a target="_blank" href={course.URL} style={STYLE.COURSE_LINK}>"Русский канон в эпоху реализма"</a>.
                        </td>
                    </tr>
                    <tr><td style={STYLE.PARAGRAPH}>Для активации промокода необходимо:</td></tr>
                    <tr><td>1) авторизоваться на сайте <a target="_blank" href={window.location.origin} style={STYLE.COURSE_LINK}>Магистерии</a></td></tr>
                    <tr><td>2) зайти на страницу курса  <a target="_blank" href={course.URL} style={STYLE.COURSE_LINK}>"Русский канон в эпоху реализма"</a></td></tr>
                    <tr><td>3) нажать на кнопку  "Купить"</td></tr>
                    <tr><td>4) на форме выбора способа оплаты ввести в поле "промокод" следующий код: <span style={STYLE.PROMO}>{_promo}</span></td></tr>
                    <tr><td>5) нажать на кнопку "Получить"</td></tr>
                    <tr><td>Также уведомляем Вас, что промокод может быть применен только один раз и только для данного курса.</td></tr>
                    <tr>
                        <td style={STYLE.PARAGRAPH}>С наилучшими пожеланиями, Магистерия.</td>
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



