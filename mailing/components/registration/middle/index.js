import React from "react"
import PropTypes from 'prop-types'

const STYLE = {
    TABLE: {
        borderSpacing: "0",
        fontFamily: "arial, helvetica, sans-serif",
        borderCollapse: "separate",
        border: "none",
        verticalAlign: "top",
        margin: "0 auto",
        width: "100%",
        maxWidth: "640px",
    },
    IMAGE_ROW: {
        textAlign: "center",
        display: "block",
        padding: "37px 0 46px"
    },
    IMAGE_BUTTON: {
        display: "inline-block",
        textAlign: "center",
    },
    IMAGE_BUTTON_CENTRAL: {
        display: "inline-block",
        textAlign: "center",
    },

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
            <tr className="image-row" style={STYLE.IMAGE_ROW}>
                <td className="image-button" style={STYLE.IMAGE_BUTTON}>
                    <img src={window.location.origin + "/images/mail/play.png"} alt="Смотрите"/>
                </td>
                <td className="image-button _central" style={STYLE.IMAGE_BUTTON_CENTRAL}>
                    <img src={window.location.origin + "/images/mail/sound.png"} alt="Слушайте"/>
                </td>
                <td className="image-button" style={STYLE.IMAGE_BUTTON}>
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

