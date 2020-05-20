import React from "react"

import "../components/common/common.sass"
import "../components/registration/registration.sass"
import TopBlock from "../components/registration/top";
import MiddleBlock from "../components/registration/middle";
import BottomBlock from "../components/registration/bottom";

export default class Registration extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        return <table width="100%">
            <tbody>
                <tr>
                    <td>
                        <TopBlock/>
                    </td>
                </tr>
                <tr>
                    <td>
                        <div style={{maxWidth: "100%", backgroundColor: "rgba(0, 0, 0, 0.05)"}}>
                            <MiddleBlock/>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>
                        <BottomBlock/>
                    </td>
                </tr>
            </tbody>
            </table>
    }
}


