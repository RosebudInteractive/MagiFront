import React from "react"
import PropTypes from 'prop-types'

const STYLE = {
    DESCRIPTION: {
        CELL: {
            padding: "20px 0 21px",
        },
        TEXT: {
            fontFamily: "Georgia",
            fontStyle: "normal",
            fontWeight: "normal",
            fontSize: "15px",
            lineHeight: "130.67%",
            color: "#2B2B2B",
            textAlign: "justify",
        },
    },

}

export default class Header extends React.Component {

    static propTypes = {
        course: PropTypes.object,
    }

    render() {
        const {course} = this.props

        return <tr>
                <td style={STYLE.DESCRIPTION.CELL}>
                    <div style={STYLE.DESCRIPTION.TEXT} dangerouslySetInnerHTML={{__html: course.Description}}/>
                </td>
            </tr>

    }
}

