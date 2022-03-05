import React from "react"
import PropTypes from 'prop-types'
import Social from "../social";


const STYLE = {
    LINK_BLOCK: {
        CELL: {
            padding: "21px 0 28px",
        },
        INNER_TABLE: {
            width: "100%"
        },
        LEFT_INNER_CELL: {
            textAlign: "left"
        },
        RIGHT_INNER_CELL: {
            textAlign: "right"
        },
        LINK: {
            fontFamily: "Arial",
            fontStyle: "normal",
            fontWeight: "normal",
            fontSize: "12px",
            lineHeight: "14px",
            color: "#C9654E",
        },
        UNSUBSCRIBE: {
            fontFamily: "Arial",
            fontStyle: "normal",
            fontWeight: "normal",
            fontSize: "12px",
            lineHeight: "14px",
            color: "#C9654E",
        }

    }
}

export default class Footer extends React.Component {

    static propTypes = {
        course: PropTypes.object,
    }

    render() {
        return <React.Fragment>
            <Social/>
            <tr>
                <td style={STYLE.LINK_BLOCK.CELL}>
                    <table style={STYLE.LINK_BLOCK.INNER_TABLE}>
                        <tbody>
                            <tr>
                                <td style={STYLE.LINK_BLOCK.LEFT_INNER_CELL}>
                                    <a style={STYLE.LINK_BLOCK.LINK} target="_blank" href="{{webversion}}">Просмотреть сообщение онлайн</a>
                                </td>
                                <td style={STYLE.LINK_BLOCK.RIGHT_INNER_CELL}>
                                    <a style={STYLE.LINK_BLOCK.LINK} target="_blank" href="{{unsubscribe_url}}">Отписаться от рассылки</a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </React.Fragment>
    }
}
