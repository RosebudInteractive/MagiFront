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
    }

    render() {
        const _params = new URLSearchParams(this.props.location.search),
            _userName = _params.get('username'),
            _message = "Здравствуйте" + (_userName ? `, ${_userName}!` : "!")

        return <table align="center" style={STYLES.MAIN_TABLE}>
                <tbody>
                <Logo/>
                <tr>
                    <td>
                        <tr>
                            <td style={STYLES.PARAGRAPH.GREETING}>
                                {_message}
                            </td>
                        </tr>
                        <tr>
                            <td style={STYLES.PARAGRAPH.THANKSGIVING}>
                                <table style={STYLE.TABLE} align="left" width="54%" className="column-table _left">
                                    <tr style={STYLE.DISCOUNT.HEADER}>
                                        <td>
                                            Мы очень рады, что Вы решили присоединиться к сообществу пользователей Magisteria.ru. Меня зовут Андрей Борейко. Я – главный редактор «Магистерии». Позвольте коротко рассказать Вам о нашем проекте.
                                            Наша цель – сохранение, развитие и популяризация качественного гуманитарного знания, а также формирование полезных навыков в разных прикладных областях.
                                        </td>
                                    </tr>
                                    <tr style={STYLE.DISCOUNT.DESCR}>
                                        <td>
                                            ФОТО АНДРЕЯ
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr><td style={STYLES.PARAGRAPH.COMMON}>Главная фигура в этом деле – это автор. Мы приглашаем в проект лучших специалистов, которые хорошо знают свой предмет и могут интересно о нем рассказать. Каждая запись проходит тщательную обработку и готовится к выпуску силами сотрудников нашей редакции.</td></tr>
                        <tr><td style={STYLE.TEXT}>Для просмотра авторизуйтесь на Магистерии под той учетной записью, в которой Вы оплатили этот курс.</td></tr>
                        <CourseDiscountBlock search={this.props.location.search}/>
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



