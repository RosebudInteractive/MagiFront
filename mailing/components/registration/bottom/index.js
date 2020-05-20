import React from "react"

import {STYLES} from "../../../styles";
import Social from "../../common/social";
import "../../common/common.sass"
import "../../registration/registration.sass"

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

export default class BottomBlock extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        return <table align="center" style={STYLES.MAIN_TABLE_EXT}>
            <tbody>
            <tr>
                <td style={STYLES.SPACE_TABLE}>&nbsp;</td>
                <td style={STYLES.CONTENT_TABLE}>
                    <table align="center" style={STYLES.MAIN_TABLE} className="registration-block">
                        <tbody>
                        <tr>
                            <td style={STYLES.PARAGRAPH.COMMON} className="font__main-text _dark">
                                <p>
                                    Проект постоянно развивается в двух магистральных направлениях: содержание и
                                    средства
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
                                    Мы надеемся, что на Магистерии Вы найдете для себя много интересного и полезного, и
                                    Вам у нас понравится.
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td style={STYLES.PARAGRAPH.LAST} className="paragraph-with-spacing">
                                <p>Искренне Ваш, Главный редактор Magisteria.ru</p>
                                <p>Андрей Борейко</p>
                                <p>P.S.: По всем вопросам Вы можете писать ….</p>
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


