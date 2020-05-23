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
                        <MiddleBlock/>
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


