import React from "react"
import PropTypes from "prop-types";

const STYLE = {
    ROW: {
        paddingTop: "9px",
    },
    BODY: {
        borderSpacing: 0
    },
    INNER_TABLE: {
        paddingTop: "6px",
        width: "100%",
        borderCollapse: "collapse",
    },
    LINK: {
        fontStyle: "normal",
        color: "#C8684C",
        display: "inline",
        textDecoration: "none"
    },
    CELL: {
        NUMBER: {
            paddingTop: "9px",
            paddingLeft: "9px",
            width: "45px",
            fontFamily: "Georgia",
            fontSize: "18px",
            lineHeight: "130%",
            fontWeight: "normal",
            color: "#C8684C",
            verticalAlign: "top",
        },
        TEXT: {
            paddingTop: "13px",
            paddingLeft: "5px",
            paddingBottom: "9px",
            fontFamily: "Arial",
            fontSize: "17px",
            lineHeight: "130%",
            fontWeight: "normal",
            color: "#2B2B2B",
        },
    },
    PROMO: {
        display: "inline",
        paddingTop: "9px",
        paddingRight: "11px",
        paddingBottom: "9px",
        paddingLeft: "11px",
        fontFamily: "Arial",
        fontSize: "20px",
        lineHeight: "130%",
        fontWeight: "bold",
        color: "#2B2B2B",
        backgroundColor: "rgba(0, 0, 0, 0.05)"
    }
}

export default class InstructionSteps extends React.Component {

    static propTypes = {
        URL: PropTypes.string,
        name: PropTypes.string,
        promo: PropTypes.string,
    }

    render() {
        return <tr>
            <td>
                <table style={STYLE.INNER_TABLE}>
                    <tbody style={STYLE.BODY}>
                        <Row number={1} text={<React.Fragment>Авторизоваться на сайте <a target="_blank" href={window.location.origin} style={STYLE.LINK}>Магистерии</a></React.Fragment>}/>
                        <Row number={2} text={<React.Fragment>Зайти на страницу курса  <a target="_blank" href={this.props.URL} style={STYLE.LINK}>"{this.props.name}"</a></React.Fragment>}/>
                        <Row number={3} text={<React.Fragment>Нажать на кнопку <span style={{fontWeight: "bold"}}>Купить</span></React.Fragment>}/>
                        <Row number={4} text={'На форме выбора способа оплаты ввести в поле "промокод" следующий код:'}/>
                        <Row text={<span style={STYLE.PROMO}>{this.props.promo}</span>}/>
                        <Row number={5} text={<React.Fragment>Нажать на кнопку <span style={{fontWeight: "bold"}}>Получить</span></React.Fragment>}/>
                    </tbody>
                </table>
            </td>
        </tr>
    }
}

class Row extends React.Component {

    static propTypes = {
        number: PropTypes.number,
        text: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    }

    render() {
        return <tr>
            <td style={STYLE.CELL.NUMBER}>
                {this.props.number && this.props.number + "."}
            </td>
            <td style={STYLE.CELL.TEXT}>
                {this.props.text}
            </td>
        </tr>
    }
}