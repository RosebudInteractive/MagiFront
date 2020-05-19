import React from "react"

import {STYLES} from "../../../styles";
import Logo from "../../common/logo";
import "../../common/common.sass"
import "../../registration/registration.sass"
import PropTypes from "prop-types";

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
    CONTENT_TABLE: {
        borderSpacing:0,
        fontFamily: "arial,helvetica,sans-serif",
        background: "#FFFFFF",
        borderCollapse: "separate",
        margin: "0 auto",
        width: "100%",
        maxWidth: "600px",
        border: "none",
        verticalAlign: "top",
    },
}

export default class TopBlock extends React.Component {

    static propTypes = {
        userName: PropTypes.string,
    }

    constructor(props) {
        super(props)
    }

    render() {
        const _message = "Здравствуйте" + (this.props.userName ? `, ${this.props.userName}.` : ".")

        return <table align="center" style={STYLES.MAIN_TABLE}>
            <tbody>
            <tr>
                <td style={STYLES.SPACE_TABLE}>&nbsp;</td>
                <td style={STYLES.CONTENT_TABLE}>
                    <table align="center" style={STYLE.CONTENT_TABLE} className="registration-block__top-block">
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
                                        <table style={STYLE.TABLE} align="left" width="50%" className="adaptive-column-block">
                                            <tr>
                                                <td className="font__main-text _dark">
                                                    Мы очень рады, что Вы решили присоединиться к сообществу пользователей
                                                    Magisteria.ru.
                                                    Меня зовут Андрей Борейко. Я – главный редактор «Магистерии».
                                                    Позвольте коротко рассказать Вам о нашем проекте.
                                                    Наша цель – сохранение, развитие и популяризация качественного гуманитарного
                                                    знания,
                                                    а также формирование полезных навыков в разных прикладных областях.
                                                </td>
                                            </tr>
                                        </table>
                                        <table style={STYLE.TABLE} align="right" width="50%" className="adaptive-column-block">
                                            <tr>
                                                <td>
                                                    <img src={window.location.origin + "/data/2016/08/unnamed-2-768x768.jpg"}
                                                         width="100%" height="auto" alt=""/>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style={STYLES.PARAGRAPH.COMMON} className="font__main-text _dark">
                                        Главная фигура в этом деле – это автор. Мы приглашаем в проект лучших специалистов,
                                        которые хорошо знают свой предмет и могут интересно о нем рассказать.
                                        Каждая запись проходит тщательную обработку и готовится к выпуску силами
                                        сотрудников нашей редакции.
                                    </td>
                                </tr>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </td>
                <td style={STYLES.SPACE_TABLE}>&nbsp;</td>
            </tr>
            </tbody>
        </table>
    }
}


