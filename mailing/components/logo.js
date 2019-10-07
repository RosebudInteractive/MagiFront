import React from "react"

const STYLE = {
    TD: {
        height: 80,
        padding: 0,
        textAlign: "left",
    },
    IMG : {
        border: 0,
    }
}

export default class Logo extends React.Component {
    render() {
        return <tr>
            <td style={STYLE.TD}>
                <a href={window.location.origin} target="_blank">
                    <img src={window.location.origin + "/images/logo.png"} alt="Magisteria" style={STYLE.IMG}/>
                </a>
            </td>
        </tr>
    }
}