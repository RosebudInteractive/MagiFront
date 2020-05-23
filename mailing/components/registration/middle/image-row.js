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


export default class ImageRow extends React.Component {
    static propTypes = {
        search: PropTypes.string,
    }

    render() {
        return  <td className="image-row" style={STYLE.IMAGE_ROW}>
            <table style={STYLE.TABLE}>
                <tbody>
                <tr>
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
                </tbody>
            </table>
        </td>
    }
}

