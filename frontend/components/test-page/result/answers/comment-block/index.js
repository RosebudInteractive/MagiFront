import React from "react"
import PropTypes from 'prop-types'

import "./comment-block.sass"
import $ from "jquery";

export default class CommentBlock extends React.Component {

    static propTypes = {
        question: PropTypes.object,
    }

    constructor(props) {
        super(props)

        this.state = {
            short: false,
            showAll: false,
            triggerVisible: false
        }

        this._resizeHandler = () => {
            const {question} = this.props

            if (!(question && question.Comment)) { return }

            const id = question.Id,
                _container = $(`#q${id}`)

            if (_container && (_container.length > 0)) {
                const _height = _container.height()

                if ((_height > 51) && (!this.state.short) && (!this.state.showAll)) {
                    this.setState({ short: true, triggerVisible: true })
                }

                if (this.state.short && (_height <= 51)) {
                    this.setState({ short: false, triggerVisible: false })
                }
            }
        }
    }

    componentDidMount(){
        $(window).bind('resize', this._resizeHandler)
        this._resizeHandler();
    }

    componentWillUnmount() {
        $(window).unbind('resize', this._resizeHandler);
    }

    render() {
        const {question} = this.props,
            text = question && question.Comment ? question.Comment : null,
            id = `q${question.Id}`

        if (!text) { return null }

        const {short, triggerVisible} = this.state,
            _title = short ? "читать все" : "скрыть"

        return text &&
            <div className="comment-block">
                <div className={"inner" + (short ? " _short" : "")}>
                    <div className="text font-universal__body-small" dangerouslySetInnerHTML={{__html: text}}/>
                    { triggerVisible && <span className="more-trigger font-universal__body-small" onClick={::this._toggle}>{_title}</span> }
                </div>
                <span className="triangle"/>
                <div className="inner hack">
                    <div className="text font-universal__body-small" dangerouslySetInnerHTML={{__html: text}} id={id}/>
                </div>
            </div>
    }

    _toggle() {
            this.setState({
                showAll: !this.state.showAll,
                short: this.state.showAll
            })
    }

    _getHeight(container) {
        if (container.children.length > 0) {
            let _result = container.offsetHeight,
                _children = container.children
            for (let i = 0; i < _children.length; i++) {
                let _height = this._getHeight(_children[i])
                _result = _result < _height ? _height : _result
            }

            return _result
        } else {
            return container.offsetTop + container.offsetHeight
        }
    }
}