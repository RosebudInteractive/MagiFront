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
}

export default class LinkedButton extends React.Component {

    static propTypes = {
        link: PropTypes.object,
        caption: PropTypes.string,
        isMobile: PropTypes.bool,
    }

    render() {
        return <td style={ this.props.isMobile ? STYLE.BUTTON.MOBILE_CELL : STYLE.BUTTON.CELL } className={this.props.isMobile ? "only-mobile-block" : ""}>
            <a target="_blank" href={this.props.link} style={STYLE.BUTTON.LINK} className={this.props.isMobile ? "only-mobile-block" : ""}>
                <table style={STYLE.BUTTON.TABLE} className={this.props.isMobile ? "only-mobile-block linked-button" : ""}>
                    <tbody className={this.props.isMobile ? "only-mobile-block linked-button" : ""}>
                    <tr className={this.props.isMobile ? "only-mobile-block linked-button" : ""}>
                        <td style={STYLE.BUTTON.ITEM} className={this.props.isMobile ? "only-mobile-block linked-button" : ""}>
                            <a target="_blank" href={this.props.link} style={STYLE.BUTTON.LINK} className={this.props.isMobile ? "only-mobile-block" : ""}>
                                <span style={STYLE.BUTTON.LINK} className={this.props.isMobile ? "only-mobile-block" : ""}>{this.props.caption}</span>
                            </a>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </a>
        </td>

    }
}
