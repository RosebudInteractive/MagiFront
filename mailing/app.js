import React from "react"

export default class Main extends React.Component {

    render() {
        return <React.Fragment>
            <div dangerouslySetInnerHTML={{__html: "<!--[if (gte mso 9)|(IE)]>"}}/>
            <table>
                <tr>
                    <td>
            <div dangerouslySetInnerHTML={{__html: "<![endif]-->"}}/>
                        <table className="outer">
                            <tbody>
                            <tr>
                                <td>

                                </td>
                            </tr>
                            </tbody>
                        </table>
            <div dangerouslySetInnerHTML={{__html: "<!--[if (gte mso 9)|(IE)]>"}}/>
                    </td>
                </tr>
            </table>
            <div dangerouslySetInnerHTML={{__html: "<![endif]-->"}}/>
        </React.Fragment>
    }
}