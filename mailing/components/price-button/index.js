import React from "react"
import PropTypes from 'prop-types'


const STYLE = {
    INNER_TABLE: {
        width: "100%",
        borderCollapse: "collapse",
    },
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
        CELL: {
            padding: "0 12px 0 0",
            width: "50%",
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
            textTransform: "uppercase",
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
    PRICE: {
        ACTUAL: {
            fontFamily: "Arial",
            fontStyle: "normal",
            fontWeight: "bold",
            fontSize: "20px",
            lineHeight: "130%",
            color: "#2F2F2F"
        },
        OLD: {
            fontFamily: "Arial",
            fontStyle: "normal",
            fontWeight: "normal",
            fontSize: "15px",
            lineHeight: "110%",
            textDecorationLine: "line-through",
            color: "rgba(47, 47, 47, 0.6)"
        },
    },

}

export default class PriceButton extends React.Component {

    static propTypes = {
        course: PropTypes.object,
    }

    render() {
        const {course} = this.props

        if (!(course && (course.IsPaid && !course.IsGift && !course.IsBought))) {
            return null
        }

        const _hasDiscount = course.DPrice && course.Discount && course.Discount.Perc,
            _price = _hasDiscount ? course.DPrice : course.Price

        return <tr>
                <td style={STYLE.CELL}>
                    <table style={STYLE.INNER_TABLE}>
                        <tbody>
                        <tr>
                            <td style={STYLE.BUTTON.CELL}>
                                <a target="_blank" href={course.URL} style={STYLE.BUTTON.LINK}>
                                    <table style={STYLE.BUTTON.TABLE}>
                                        <tbody>
                                        <tr>
                                            <td style={STYLE.BUTTON.ITEM}>
                                                <a target="_blank" href={course.URL} style={STYLE.BUTTON.LINK}>
                                                    <span style={STYLE.BUTTON.LINK}>КУПИТЬ</span>
                                                </a>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </a>
                            </td>
                            <td>
                                <div style={STYLE.PRICE.ACTUAL}>{_price + ' руб'}</div>
                                {
                                    _hasDiscount ?
                                        <div style={STYLE.PRICE.OLD}>{course.Price}</div>
                                        :
                                        null
                                }
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
    }
}
