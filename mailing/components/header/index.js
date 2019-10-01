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
    }
}

export default class Header extends React.Component {

    static propTypes = {
        course: PropTypes.object,
    }

    render() {
        const {course} = this.props,
            _coverUrl = '/data/' + (course.LandCover ? course.LandCover : course.Cover)

        return <React.Fragment>
                <tr>
                    <td style={STYLE.TITLE}>Новый курс</td>
                </tr>
                <tr>
                    <td style={STYLE.COURSE.WRAPPER}>
                        <div style={STYLE.COURSE.TITLE}>Курс: </div>
                        <div style={STYLE.COURSE.NAME}>{course.Name}</div>
                    </td>
                </tr>
                <tr>
                    <td>
                        <img src={_coverUrl} alt={course.Name} style={STYLE.IMG}/>
                    </td>
                </tr>
            </React.Fragment>
    }
}

