import React from "react"
import PropTypes from 'prop-types'
import "./linked-button.sass"


const STYLE = {
    CELL: {
        padding: "20px 0 0",
    },
    BUTTON: {
        TABLE: {
            width: "100%",
            callSpacing: 0,
            borderCollapse: "collapse",
            height: "43px"
        },
        MOBILE_CELL: {
            padding: "0",
            width: "100%",
            display: "none",
            height: 0,
            maxHeight: 0,
            overflow: "hidden"
        },
        CELL: {
            padding: "0",
            width: "100%",
            display: "block",
        },
        ITEM: {
            padding: "11px 0",
            width: "100%",
            background: "#C8684C",
            fontFamily: "Arial",
            fontStyle: "normal",
            fontWeight: "bold",
            fontSize: "15px",
            lineHeight: "140%",
            textAlign: "center",
            letterSpacing: "0.1em",
            color: "#FFFFFF",
            borderRadius: "4px",
            cursor: "pointer",
        },
        LINK: {
            textDecoration: "none",
            textTransform: "uppercase",
            color: "#FFFFFF",
        }
    },
},

    MOBILE_STYLE = {
    BUTTON: {
        TABLE: {
            width: "100%",
            callSpacing: 0,
            borderCollapse: "collapse",
            height: "43px",
            display: "none",
            maxHeight: 0,
            overflow: "hidden",
        },
        CELL: {
            padding: "0",
            width: "100%",
            display: "none",
            height: 0,
            maxHeight: 0,
            overflow: "hidden",
        },
        ITEM: {
            padding: "11px 0",
            width: "100%",
            background: "#C8684C",
            fontFamily: "Arial",
            fontStyle: "normal",
            fontWeight: "bold",
            fontSize: "15px",
            lineHeight: "140%",
            textAlign: "center",
            letterSpacing: "0.1em",
            color: "#FFFFFF",
            borderRadius: "4px",
            cursor: "pointer",
            display: "none",
            height: 0,
            maxHeight: 0,
            overflow: "hidden",
        },
        LINK: {
            textDecoration: "none",
            textTransform: "uppercase",
            color: "#FFFFFF",
            display: "none",
            height: 0,
            maxHeight: 0,
            overflow: "hidden",
        }
    },
}

export default class LinkedButton extends React.Component {

    static propTypes = {
        link: PropTypes.object,
        caption: PropTypes.string,
        isMobile: PropTypes.bool,
    }

    render() {
        let _STYLE = this.props.isMobile ? MOBILE_STYLE : STYLE,
            _className = this.props.isMobile ? "only-mobile-block" : "",
            _buttonClassName = this.props.isMobile ? "only-mobile-block linked-button" : ""

        return <td style={ _STYLE.BUTTON.CELL } className={_className}>
            <a target="_blank" href={this.props.link} style={_STYLE.BUTTON.LINK} className={_className}>
                <table style={_STYLE.BUTTON.TABLE} className={_buttonClassName}>
                    <tbody className={_buttonClassName}>
                    <tr className={_buttonClassName}>
                        <td style={_STYLE.BUTTON.ITEM} className={_buttonClassName}>
                            <a target="_blank" href={this.props.link} style={_STYLE.BUTTON.LINK} className={_className}>
                                <span style={_STYLE.BUTTON.LINK} className={_className}>{this.props.caption}</span>
                            </a>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </a>
        </td>

    }
}
