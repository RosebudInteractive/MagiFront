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
            <div style={{maxWidth: "640px"}}>
                <TopBlock/>
            </div>
            <div style={{maxWidth: "100%", backgroundColor: "rgba(0, 0, 0, 0.05)"}}>
                <MiddleBlock/>
            </div>
            <div style={{maxWidth: "640px"}}>
                <BottomBlock/>
            </div>
            </React.Fragment>


    }
}


