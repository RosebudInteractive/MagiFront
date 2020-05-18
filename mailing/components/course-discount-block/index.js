import React from "react"
import PropTypes from 'prop-types'
import "./course-discount-block.sass"
import {STYLES} from "../../styles";
import LinkedButton from "../common/linked-button";

const DISCOUNT = [
    {level: 1, value: 20, descr: "При покупке следующего курса в течение 2 дней Вы получите скидку 20% по промокоду"},
    {level: 2, value: 30, descr: "Если Вы приобретете еще один курс в течение 48 часов, то получите скидку 30% по промокоду"},
    {level: 3, value: 35, descr: "На очередной курс, приобретенный сегодня или завтра Вы получаете скидку 35% по промокоду"},
    {level: 4, value: 40, descr: "Теперь Вы получите скидку 40%, если купите один из курсов Магистерии не позднее завтрашнего вечера - используйте промокод"},
    {level: 5, value: 45, descr: "А теперь скидка выросла еще на 5%. Купите в течение 2 дней еще 1 курс с дисконтом 45% по промокоду"},
    {level: 6, value: 50, descr: "Вы достигли суперскидки и можете купить любой наш курс в 2 раза дешевле, используйте для этого ограниченный по времени (2 суток) промокод"},
]


const STYLE = {
    TABLE: {
        borderSpacing:0,
        fontFamily: "arial,helvetica,sans-serif",
        background: "#FFFFFF",
        borderCollapse: "collapse",
        border: "none",
        verticalAlign: "top",
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
                borderSpacing:0,
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


export default class CourseDiscountBlock extends React.Component {
    static propTypes = {
        search: PropTypes.string,
    }

    render() {
        const _discount = this._getDiscount()

        if (!_discount) return null

        return <tr>
            <td style={STYLE.TABLE_ROW}>
                <table className="course-promo__table">
                    <tbody style={STYLE.BODY}>
                        <tr>
                            <td>
                                <table style={STYLE.TABLE} align="left" width="275" className="column-table _left">
                                    <tr style={STYLE.DISCOUNT.HEADER}>
                                        <td>{`Получите скидку ${_discount.value}%`}</td>
                                    </tr>
                                    <tr style={STYLE.DISCOUNT.DESCR}>
                                        <td>{_discount.descr}</td>
                                    </tr>
                                </table>
                                <table width="20" align="left" border="0" cellPadding="0" cellSpacing="0" className="spacer-table">
                                    <tbody>
                                    <tr>
                                        <td width="100%" height="12" bgcolor="#E59EDF">&nbsp;</td>
                                    </tr>
                                    </tbody>
                                </table>
                                <table style={STYLE.TABLE} align="left" width="197" className="column-table _right">
                                    <tr style={{display: "block"}}>
                                        <td style={STYLE.DISCOUNT.PROMO_ROW}>
                                            <div style={STYLE.DISCOUNT.PROMO}>{_discount.promo}</div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <LinkedButton caption={"Выбрать курс"} link={window.location.origin} isMobile={false}/>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </td>
            </tr>
    }

    _getDiscount() {
        const _params = new URLSearchParams(this.props.search),
            _promo = _params.get('promo'),
            _level = _params.get('lvl'),
            _discount = _level && DISCOUNT.find(item => item.level === +_level)

        return _discount && {promo : _promo, value: _discount.value, descr: _discount.descr}
    }
}

