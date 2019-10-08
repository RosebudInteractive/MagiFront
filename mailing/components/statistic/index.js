import React from "react"
import PropTypes from 'prop-types'


const STYLE = {
    BODY: {
      borderSpacing: 0
    },
    INNER_TABLE: {
        width: "100%",
        borderCollapse: "collapse",
    },
    CELL: {
        LEFT: {
            paddingTop: 0,
            paddingBottom: 0,
            paddingRight: "10px",
            width: "50%",
            height: "37px",
        },
        RIGHT: {
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: "10px",
            width: "50%",
            height: "37px",
        },
        WRAPPER: {
            padding: "8px 0",
            borderBottom: "1px solid #d9d9d9"
        },
        EMPTY: {
            LEFT: {
                paddingTop: 0,
                paddingBottom: 0,
                paddingRight: "10px",
                width: "50%",
                height: 0,
            },
            RIGHT: {
                paddingTop: 0,
                paddingBottom: 0,
                paddingLeft: "10px",
                width: "50%",
                height: 0,
            },
            WRAPPER: {
                height: 0,
                padding: 0,
                borderBottom: "1px solid #d9d9d9"
            }
        }
    },
    TEXT: {
        COUNTER: {
            fontFamily: "Arial",
            fontStyle: "normal",
            fontWeight: "bold",
            fontSize: "15px",
            lineHeight: "140%",
            color: "#2F2F2F",
            display: "inline",
        },
        DESCRIPTION: {
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

export default class Statistic extends React.Component {

    static propTypes = {
        course: PropTypes.object,
    }

    render() {

        const {course} = this.props,
            _duration = course.statistics.lessons.duration,
            _totalCount = course.statistics.lessons.total,
            _subsCount = course.statistics.lessons.sublessonsCount


        return <tr>
            <td>
                <table style={STYLE.INNER_TABLE}>
                    <tbody style={STYLE.BODY}>
                    <tr>
                        <td style={STYLE.CELL.EMPTY.LEFT}>
                            <div style={STYLE.CELL.EMPTY.WRAPPER}/>
                        </td>
                        <td style={STYLE.CELL.EMPTY.RIGHT}>
                            <div style={STYLE.CELL.EMPTY.WRAPPER}/>
                        </td>
                    </tr>
                    <tr>
                        <td style={STYLE.CELL.LEFT}>
                            <div style={STYLE.CELL.WRAPPER}>
                                <span style={STYLE.TEXT.COUNTER}>{_totalCount + ' '}</span>
                                <span style={STYLE.TEXT.DESCRIPTION}>лекций</span>
                            </div>
                        </td>
                        <td style={STYLE.CELL.RIGHT}>
                            <div style={STYLE.CELL.WRAPPER}>
                                <span style={STYLE.TEXT.COUNTER}>{`${_duration.hours}ч ${_duration.minutes}м `}</span>
                                <span style={STYLE.TEXT.DESCRIPTION}> - время просмотра</span>
                            </div>
                        </td>
                    </tr>
                    {
                        _subsCount ?
                            <tr>
                                <td style={STYLE.CELL.LEFT}>
                                    <div style={STYLE.CELL.WRAPPER}>
                                        <span style={STYLE.TEXT.COUNTER}>{_subsCount + ' '}</span>
                                        <span style={STYLE.TEXT.DESCRIPTION}>доп. эпизодов</span>
                                    </div>
                                </td>
                                <td/>
                            </tr>
                            :
                            null
                    }

                    </tbody>
                </table>
            </td>
        </tr>
    }
}
