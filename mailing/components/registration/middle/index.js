import React from "react"
import PropTypes from 'prop-types'
import {STYLES} from "../../../styles";

const STYLE = {
    TABLE: {
        borderSpacing: "0",
        fontFamily: "arial, helvetica, sans-serif",
        background: "rgba(0, 0, 0, 0.05)",
        borderCollapse: "separate",
        border: "none",
        verticalAlign: "top",
        margin: "0 auto",
        width: "100%",
        maxWidth: "600px",
    },
    TABLE_ROW: {
        paddingTop: "15px",
        paddingBottom: "15px",
    },
    HEADER: {
        paddingTop: "18px",
        fontFamily: "Arial",
        fontSize: "18px",
        lineHeight: "130%",
        fontWeight: "bold",
    },
    DISCOUNT: {
        HEADER: {
            fontFamily: "Arial",
            fontStyle: "normal",
            fontWeight: "bold",
            fontSize: "23px",
            lineHeight: "130%",
            color: "#2F2F2F",
        },
        DESCR: {
            fontFamily: "Arial",
            fontStyle: "normal",
            fontWeight: "normal",
            fontSize: "18px",
            lineHeight: "130%",
            color: "#000000",
            paddingTop: "6px",
        },
        PROMO_ROW: {
            paddingTop: "4px",
            paddingBottom: "15px",
            display: "block",
            width: "100%"
        },
        PROMO: {
            display: "block",
            paddingTop: "9px",
            paddingRight: "11px",
            paddingBottom: "9px",
            paddingLeft: "11px",
            fontFamily: "Arial",
            fontSize: "20px",
            lineHeight: "130%",
            fontWeight: "bold",
            color: "#2B2B2B",
            backgroundColor: "rgba(0, 0, 0, 0.05)",
            textAlign: "center"
        },
    },
    MOBILE: {
        ROW: {
            display: "none",
            height: 0,
            overflow: "hidden",
        },
        DISCOUNT: {
            TABLE: {
                borderSpacing: 0,
                fontFamily: "arial,helvetica,sans-serif",
                background: "#FFFFFF",
                borderCollapse: "collapse",
                margin: "0 auto",
                border: "none",
                display: "none",
                height: 0,
                overflow: "hidden",
            },
            BODY: {
                paddingTop: "8px",
                display: "none",
                height: 0,
                overflow: "hidden",
            },
            RECORD: {
                display: "none",
                height: 0,
                overflow: "hidden",
            },
            PROMO_ROW: {
                paddingTop: "4px",
                paddingBottom: "15px",
                display: "none",
                width: "100%",
                height: 0,
                overflow: "hidden",
            },
            PROMO: {
                display: "none",
                paddingTop: "9px",
                paddingRight: "11px",
                paddingBottom: "9px",
                paddingLeft: "11px",
                fontFamily: "Arial",
                fontSize: "20px",
                lineHeight: "130%",
                fontWeight: "bold",
                color: "#2B2B2B",
                backgroundColor: "rgba(0, 0, 0, 0.05)",
                textAlign: "center"
            },
        }
    }

}


export default class MiddleBlock extends React.Component {
    static propTypes = {
        search: PropTypes.string,
    }

    render() {
        return <table style={STYLE.TABLE} className="registration-block__central-block">
            <tbody style={STYLE.BODY}>
            <tr>
                <td className="header font-universal__header _dark">
                    Смотрите. Слушайте. Читайте.
                </td>
            </tr>
            <tr className="image-row">
                <td className="image-button">
                    <img src={window.location.origin + "/images/mail/play.png"} alt="Смотрите"/>
                </td>
                <td className="image-button _central">
                    <img src={window.location.origin + "/images/mail/sound.png"} alt="Слушайте"/>
                </td>
                <td className="image-button">
                    <img src={window.location.origin + "/images/mail/glasses.png"} alt="Читайте"/>
                </td>
            </tr>
            <tr>
                <td className="text font-registration__central-block">
                    Лекции на Магистерии можно смотреть, слушать и читать.<br/>Галерея с иллюстрациями, задания и тесты,
                    рекомендуемая литература и другие вспомогательные материалы помогают закрепить знания и наметить
                    направления для самостоятельной работы.
                </td>
            </tr>
            </tbody>
        </table>
    }
}

