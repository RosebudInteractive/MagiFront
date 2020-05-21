import React from "react"
import PropTypes from 'prop-types'
import ImageRow from "./image-row";

const STYLE = {
    TOP_TABLE: {
        borderSpacing: "0",
        borderCollapse: "separate",
        border: "none",
        width: "100%",
        maxWidth: "100%",
    },
    PADDING_TABLE: {
        borderSpacing: "0",
        fontFamily: "arial, helvetica, sans-serif",
        borderCollapse: "separate",
        border: "none",
        verticalAlign: "top",
        margin: "0 auto",
        width: "100%",
        maxWidth: "640px",
    }
    ,TABLE: {
        borderSpacing: "0",
        fontFamily: "arial, helvetica, sans-serif",
        borderCollapse: "collapse",
        border: "none",
        verticalAlign: "top",
        margin: "0 auto",
        width: "100%",
        maxWidth: "640px",
        borderColor: "none",
    },
    HEADER: {
        color: "#2b2b2b",
        fontFamily: "arial, helvetica, sans-serif",
        fontSize: "23px",
        fontWeight: "bold",
        lineHeight: "130%",
        padding: "0 14% 0 14%",
        textAlign: "center",
    },
    IMAGE_TABLE: {
        borderSpacing: "0",
        fontFamily: "arial, helvetica, sans-serif",
        borderCollapse: "separate",
        border: "none",
        verticalAlign: "top",
        margin: "0 auto",
        width: "100%",
        maxWidth: "640px",
        textAlign: "center",
    },
    SPACE: {
        fontSize: "15px",
        lineHeight: "115%"
    },
    TEXT: {
        fontFamily: "arial, helvetica, sans-serif",
        fontSize: "15px",
        color: "#2B2B2B",
        fontWeight: "normal",
        lineHeight: "130%",
        textAlign: "center",
        border: "none",
    }
}


export default class MiddleBlock extends React.Component {
    static propTypes = {
        search: PropTypes.string,
    }

    render() {
        return <table align="center" width="100%" style={STYLE.TOP_TABLE} bgcolor="#EBEBEB">
            <tbody>
            <tr>
                <td>
                    <center>
                        <table style={STYLE.PADDING_TABLE} className="registration-block__central-block">
                            <tbody style={STYLE.BODY}>
                            <tr>
                                <td width="6%" style={STYLE.SPACE}>&nbsp;</td>
                                <td>
                                    <table style={STYLE.TABLE}>
                                        <tbody>
                                        <tr>
                                            <td style={STYLE.SPACE}><p style={{height: "62px", marginBottom: "0", marginTop: "0", padding:"0"}}>&nbsp;</p></td>
                                        </tr>
                                        <tr>
                                            <td className="header font-universal__header _dark" style={STYLE.HEADER}>
                                                Смотрите. Слушайте. Читайте.
                                            </td>
                                        </tr>
                                        <tr>
                                            <ImageRow/>
                                        </tr>
                                        <tr>
                                            <td style={STYLE.TEXT} className="text font-registration__central-block">
                                                Лекции на Магистерии можно смотреть, слушать и читать.<br/>Галерея с
                                                иллюстрациями, задания и тесты,
                                                рекомендуемая литература и другие вспомогательные материалы помогают
                                                закрепить знания и наметить
                                                направления для самостоятельной работы.
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={STYLE.SPACE}><p style={{height: "45px", marginBottom: "0", marginTop: "0", padding:"0"}}>&nbsp;</p></td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </td>
                                <td width="6%" style={STYLE.SPACE}>&nbsp;</td>
                            </tr>
                            </tbody>
                        </table>
                    </center>
                </td>
            </tr>
            </tbody>
        </table>
    }
}

