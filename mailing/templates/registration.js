import React from "react"

import "../components/common/common.sass"
import "../components/registration/registration.sass"
import TopBlock from "../components/registration/top";
import MiddleBlock from "../components/registration/middle";
import BottomBlock from "../components/registration/bottom";

const STYLE = {
    TEXT: {
        fontFamily: "Arial",
        fontSize: "18px",
        lineHeight: "130%",
    },
    TABLE: {
        borderSpacing: "0",
        fontFamily: "arial,helvetica,sans-serif",
        background: "#FFFFFF",
        borderCollapse: "collapse",
        border: "none",
        verticalAlign: "top",
    },
}

export default class Registration extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        return <React.Fragment>
                <TopBlock/>
                <MiddleBlock/>
                <BottomBlock/>
            </React.Fragment>


    }
}


