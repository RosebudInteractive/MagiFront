import React from "react"
import PropTypes from 'prop-types'


const STYLE = {
    BUTTON: {
        TABLE: {
            width: "100%",
            callSpacing: 0,
            borderCollapse: "collapse",
            height: "43px"
        },
        CELL: {
            padding: "21px 0",
        },
        ITEM: {
            padding: "6px 0",
            width: "100%",
            height: "32px",
            background: "#C8684C",
            fontFamily: "Arial",
            fontStyle: "normal",
            fontWeight: "bold",
            fontSize: "15px",
            lineHeight: "140%",
            textAlign: "center",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#FFFFFF",
            borderRadius: "4px",
            cursor: "pointer",
        },
        LINK: {
            textTransform: "uppercase",
            color: "#FFFFFF",
            textDecoration: "none"
        }
    },
}

export default class LearnLessonButton extends React.Component {

    static propTypes = {
        course: PropTypes.object,
    }

    render() {
        const {course} = this.props

        return <tr>
                <td style={STYLE.BUTTON.CELL}>
                    <a target="_blank" href={course.URL} style={STYLE.BUTTON.LINK}>
                        <table style={STYLE.BUTTON.TABLE}>
                            <tbody>
                                <tr>
                                    <td style={STYLE.BUTTON.ITEM}>
                                        <a target="_blank" href={course.URL} style={STYLE.BUTTON.LINK}>
                                            ИЗУЧИТЬ КУРС
                                        </a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </a>
                </td>
            </tr>
    }
}
