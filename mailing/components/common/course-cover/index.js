import React from "react"
import PropTypes from 'prop-types'

const STYLE = {
    TITLE: {
        fontFamily: "Arial",
        fontStyle: "normal",
        fontWeight: "bold",
        fontSize: "12px",
        lineHeight: "140%",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        padding: "20px 0 15px",
        color: "#2B2B2B",
    },
    COURSE: {
        WRAPPER: {
            paddingBottom: "20px",
        },
        TITLE: {
            display: "inline",
            fontFamily: "Georgia",
            fontStyle: "italic",
            fontWeight: "normal",
            fontSize: "24px",
            lineHeight: "120%",
            color: "#C8684C",
        },
        NAME: {
            display: "inline",
            fontFamily: "Georgia",
            fontStyle: "normal",
            fontWeight: "normal",
            fontSize: "24px",
            lineHeight: "120%",
            color: "#2F2F2F",
        },
    },
    IMG : {
        border: 0,
        width: "100%",
        display: "block",
    },
    IMAGE_CELL: {
        width: "552px",
    }
}

export default class CourseCover extends React.Component {

    static propTypes = {
        course: PropTypes.object,
    }

    render() {
        const {course} = this.props,
            _coverUrl = course.LandCover ? course.LandCover : course.Cover

        return <React.Fragment>
                <tr>
                    <td style={STYLE.IMAGE_CELL}>
                        <a target="_blank" href={course.URL}>
                            <img src={_coverUrl} width="552" alt={course.Name} style={STYLE.IMG}/>
                        </a>
                    </td>
                </tr>
            </React.Fragment>
    }
}

