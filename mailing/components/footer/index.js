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
    SOCIAL: {
        CELL: {
            height: "62px",
            padding: 0,
            textAlign: "center",
        },
        ICON: {
            paddingRight: "24px",
        }
    },
    LINK_BLOCK: {
        CELL: {
            padding: "21px 0 28px",
        },
        INNER_TABLE: {
            width: "100%"
        },
        LEFT_INNER_CELL: {
            textAlign: "left"
        },
        RIGHT_INNER_CELL: {
            textAlign: "right"
        },
        LINK: {
            fontFamily: "Arial",
            fontStyle: "normal",
            fontWeight: "normal",
            fontSize: "12px",
            lineHeight: "14px",
            color: "#C9654E",
        },
        UNSUBSCRIBE: {
            fontFamily: "Arial",
            fontStyle: "normal",
            fontWeight: "normal",
            fontSize: "12px",
            lineHeight: "14px",
            color: "#C9654E",
        }

    }
}

const fbUrl = "https://www.facebook.com/Magisteria.ru/",
    okUrl = "https://ok.ru/group/54503517782126",
    twUrl = "https://twitter.com/MagisteriaRu",
    vkUrl = "https://vk.com/magisteriaru"

export default class Footer extends React.Component {

    static propTypes = {
        course: PropTypes.object,
    }

    render() {
        const {course} = this.props

        return <React.Fragment>
            <tr>
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
            <tr>
               <td style={STYLE.SOCIAL.CELL}>
                   <a target="_blank" href={twUrl}>
                       <img style={STYLE.SOCIAL.ICON} src={'/images/mail-tw.png'} alt={'twitter'}/>
                   </a>
                   <a target="_blank" href={fbUrl}>
                       <img style={STYLE.SOCIAL.ICON} src={'/images/mail-fb.png'} alt={'facebook'}/>
                   </a>
                   <a target="_blank" href={vkUrl}>
                       <img style={STYLE.SOCIAL.ICON} src={'/images/mail-vk.png'} alt={'vk'}/>
                   </a>
               </td>
            </tr>
            <tr>
                <td style={STYLE.LINK_BLOCK.CELL}>
                    <table style={STYLE.LINK_BLOCK.INNER_TABLE}>
                        <tbody>
                            <tr>
                                <td style={STYLE.LINK_BLOCK.LEFT_INNER_CELL}>
                                    <a style={STYLE.LINK_BLOCK.LINK} target="_blank" href="{{webversion}}">Просмотреть сообщение онлайн</a>
                                </td>
                                <td style={STYLE.LINK_BLOCK.RIGHT_INNER_CELL}>
                                    <a style={STYLE.LINK_BLOCK.LINK} target="_blank" href="{{unsubscribe_url}}">Отписаться от рассылки</a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </React.Fragment>
    }
}
