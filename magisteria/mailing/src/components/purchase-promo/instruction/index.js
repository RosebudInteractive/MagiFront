import React from "react"
import PropTypes from 'prop-types'
import InstructionSteps from "./inner-table";

const STYLE = {
    HEADER: {
        paddingTop: "18px",
        fontFamily: "Arial",
        fontSize: "18px",
        lineHeight: "130%",
        fontWeight: "bold",
    },


}

export default class PromoInstruction extends React.Component {
    static propTypes = {
        URL: PropTypes.string,
        name: PropTypes.string,
        promo: PropTypes.string,
    }

    render() {
        return <React.Fragment>
            <tr><td style={STYLE.HEADER}>Для активации промокода необходимо:</td></tr>
            <InstructionSteps URL={this.props.URL} name={this.props.name} promo={this.props.promo}/>
        </React.Fragment>
    }
}

