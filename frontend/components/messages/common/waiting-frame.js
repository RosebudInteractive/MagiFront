import React from 'react'
import PropTypes from 'prop-types'

export default class WaitingFrame extends React.Component {

    static propTypes = {
        visible: PropTypes.bool,
        message: PropTypes.string,
    }

    static defaultProps = {
        message: "Пожалуйста подождите..."
    }

    render() {
        const {visible} = this.props

        return <div className={"waiting-frame" + (visible ? " _visible" : "")}>
                <p className={"waiting-frame__title"}>{this.props.message}</p>
                <div className={"waiting-frame_loader"}>
                    <svg version="1.1" id="loader-1" xmlns="http://www.w3.org/2000/svg"
                         width="40px" height="40px" viewBox="0 0 50 50" style={{enableBackground: "new 0 0 50 50"}}
                         xmlSpace="preserve">
                        <path fill="#000"
                              d="M43.935,25.145c0-10.318-8.364-18.683-18.683-18.683c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615c8.072,0,14.615,6.543,14.615,14.615H43.935z">
                            <animateTransform attributeType="xml"
                                              attributeName="transform"
                                              type="rotate"
                                              from="0 25 25"
                                              to="360 25 25"
                                              dur="0.6s"
                                              repeatCount="indefinite"/>
                        </path>
                    </svg>
                </div>
            </div>
    }
}