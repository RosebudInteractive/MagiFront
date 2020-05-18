import React from "react"

import {STYLES} from "../styles";
import Logo from "../components/common/logo";
import Social from "../components/common/social";
import "../components/common/common.sass"
import "../components/registration/registration.sass"

const STYLE = {
    TEXT: {
        fontFamily: "Arial",
        fontSize: "18px",
        lineHeight: "130%",
    },
    TABLE: {
        borderSpacing: "0",
        fontFamily: "arial,helvetica,sans-serif",
        background: "#FFFFFF",
        borderCollapse: "collapse",
        border: "none",
        verticalAlign: "top",
    },
}

export default class Registration extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        const _params = new URLSearchParams(this.props.location.search),
            _userName = _params.get('username'),
            _message = "Здравствуйте" + (_userName ? `, ${_userName}.` : ".")

        return <table align="center" style={STYLES.MAIN_TABLE} className="registration-block">
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
                                <table style={STYLE.TABLE} align="left" width="50%" className="column-table _left">
                                    <tr>
                                        <td className="font__main-text _dark">
                                            Мы очень рады, что Вы решили присоединиться к сообществу пользователей Magisteria.ru.
                                            Меня зовут Андрей Борейко. Я – главный редактор «Магистерии».
                                            Позвольте коротко рассказать Вам о нашем проекте.
                                            Наша цель – сохранение, развитие и популяризация качественного гуманитарного знания,
                                            а также формирование полезных навыков в разных прикладных областях.
                                        </td>
                                    </tr>
                                </table>
                                <table style={STYLE.TABLE} align="right" width="50%" className="column-table _left">
                                    <tr>
                                        <td>
                                            <img src={window.location.origin + "/data/2016/08/unnamed-2-768x768.jpg"} width="100%" height="auto" alt=""/>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style={STYLES.PARAGRAPH.COMMON}>
                                Главная фигура в этом деле – это автор. Мы приглашаем в проект лучших специалистов,
                                которые хорошо знают свой предмет и могут интересно о нем рассказать.
                                Каждая запись проходит тщательную обработку и готовится к выпуску силами
                                сотрудников нашей редакции.
                            </td>
                        </tr>

                        <tr>
                            <td style={STYLES.PARAGRAPH.COMMON} className="paragraph-with-spacing">
                                <p>
                                    Проект постоянно развивается в двух магистральных направлениях: содержание и средства
                                    для работы с контентом. Мы постоянно ищем и приглашаем новых интересных авторов,
                                    открываем новые темы. Ведется разработка новых функциональных возможностей,
                                    в том числе интерактивных.
                                </p>
                                <p>
                                    Часть курсов на сайте – платные. Часть – бесплатные. Для просмотра и тех и других
                                    требуется регистрация. Средства, полученные от продажи платных курсов, позволяют
                                    развивать проект и создавать новые курсы, в том числе общедоступные.
                                </p>
                                <p>
                                    Мы надеемся, что на Магистерии Вы найдете для себя много интересного и полезного, и Вам у нас понравится.
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td style={STYLES.PARAGRAPH.LAST} className="paragraph-with-spacing">
                                Искренне Ваш, Главный редактор Magisteria.ru<br/>
                                Андрей Борейко<br/>
                                P.S.: По всем вопросам Вы можете писать ….
                            </td>
                        </tr>
                    </td>
                </tr>
                <Social/>
                </tbody>
            </table>
    }
}


