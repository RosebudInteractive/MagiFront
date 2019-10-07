import React from "react"
import PropTypes from 'prop-types'


const STYLE = {
    BODY: {
        borderSpacing: 0
    },
    CELL: {
        TITLE: {
            height: "69px",
            fontFamily: "Georgia",
            fontStyle: "normal",
            fontWeight: "normal",
            fontSize: "24px",
            lineHeight: "120%",
            borderBottom: "1px solid #d9d9d9"
        },
        COMMON: {
            padding: "16px 0",
            borderBottom: "1px solid #d9d9d9"
        },
        WRAPPER: {
            // padding: "16px 0",
            width: "100%"
        }
    },
    TEXT: {
        COUNTER: {
            fontFamily: "Arial",
            fontStyle: "normal",
            fontWeight: "normal",
            fontSize: "15px",
            lineHeight: "140%",
            color: "#C9644E",
            display: "inline",
        },
        FREE_LESSON: {
            fontFamily: "Arial",
            fontStyle: "normal",
            fontWeight: "bold",
            fontSize: "15px",
            lineHeight: "140%",
            color: "#2B2B2B",
            display: "inline",
        },
        FREE_MARK: {
            fontFamily: "Arial",
            fontStyle: "normal",
            fontWeight: "bold",
            fontSize: "15px",
            lineHeight: "140%",
            color: "#C9644E",
            display: "inline",
        },
        DRAFT_LESSON: {
            fontFamily: "Arial",
            fontStyle: "normal",
            fontWeight: "normal",
            fontSize: "15px",
            lineHeight: "140%",
            color: "#d9d9d9",
            display: "inline",
        },
        COMMON_LESSON: {
            fontFamily: "Arial",
            fontStyle: "normal",
            fontWeight: "normal",
            fontSize: "15px",
            lineHeight: "140%",
            color: "#2F2F2F",
            display: "inline",
        }
    }
}

export default class Scheme extends React.Component {

    static propTypes = {
        course: PropTypes.object,
    }

    render() {
        return <React.Fragment>
            <tr>
                <td style={STYLE.CELL.TITLE}>
                    Програма курса
                </td>

            </tr>
            {this._getLessons()}
        </React.Fragment>
    }

    _getLessons() {
        return this.props.course.Lessons.map((item) => {
            const _title = item.Name.match(/[-.?!)(,:]$/g) ? item.Name : (item.Name + '.')

            if (this.props.course.IsPaid && item.IsFreeInPaidCourse) {
                return <tr>
                    <td style={STYLE.CELL.COMMON}>
                        <div style={STYLE.CELL.WRAPPER}>
                            <span style={STYLE.TEXT.COUNTER}>{item.Number + '. '}</span>
                            <span style={STYLE.TEXT.FREE_LESSON}>{_title}</span>
                            <span style={STYLE.TEXT.FREE_MARK}> Бесплатно</span>
                        </div>
                    </td>
                </tr>
            } else if (item.STATE === "D") {
                return <tr>
                    <td style={STYLE.CELL.COMMON}>
                        <div style={STYLE.CELL.WRAPPER}>
                            <span style={STYLE.TEXT.COUNTER}>{item.Number + '. '}</span>
                            <span style={STYLE.TEXT.DRAFT_LESSON}>{_title + ' ' + item.readyMonth + ' ' + item.readyYear}</span>
                        </div>
                    </td>
                </tr>
            } else {
                return <tr>
                    <td style={STYLE.CELL.COMMON}>
                        <div style={STYLE.CELL.WRAPPER}>
                            <span style={STYLE.TEXT.COUNTER}>{item.Number + '. '}</span>
                            <span style={STYLE.TEXT.COMMON_LESSON}>{_title}</span>
                        </div>
                    </td>
                </tr>
            }
        })
    }
}
