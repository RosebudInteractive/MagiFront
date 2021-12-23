import React from "react"
import {querySelector, search} from "ducks/search";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {OverflowHandler, pages} from "tools/page-tools";
import {hideMenu} from "actions/page-header-actions";

const SEARCH = '<use xlink:href="#search"/>',
    ARROW = '<use xlink:href="#next"/>',
    CLOSE = '<use xlink:href="#close-no-color"/>'

class SearchItem extends React.Component{

    constructor(props) {
        super(props)

        this._queryActive = !!this.props.query

        this.state = {
            active: this._queryActive,
            visible: this._queryActive,
            hiding: false,
        }

        this._isTouchDevice = window.hasOwnProperty("ontouchstart") && window.hasOwnProperty("ontouchend")
        this._touchMoved = false

        this.input = null
        this._touchEventName = this.props.isMobileApp ? 'touchend' : 'mouseup'

        this._handler = (e) => {
            if (this._touchMoved) {
                return
            }

            const _isSearch = e.target.closest('.search-string')

            if (this.state.active && !_isSearch) {
                this._hideSearchString()
            }
        }
    }

    componentDidMount() {
        this._addEventListeners()

        if (this.state.active) {
            if (this.input && !this.input.value && this.props.query) {
                this.input.value = this.props.query
                this.forceUpdate()
            }

            $(".page-header__row").addClass("_search-mode")
        }
    }

    componentWillUnmount() {
        this._removeEventListeners()
        $(".page-header__row").removeClass("_search-mode")
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.active && !prevState.active) {
            setTimeout(() => {this.setState({visible: true})}, 100)
            $(".page-header__row").addClass("_search-mode")
        }

        if (this.state.visible && !prevState.visible) {
            $(".page-header__row").addClass("_search-mode")

            if (this.input && !this.input.value && this.props.query) {
                this.input.value = this.props.query
                this.forceUpdate()
            }

            setTimeout(() => {
                document.getElementById("search-input").focus()
            }, 500)
        }

        if (!this.state.active && prevState.active) {
            $(".page-header__row").removeClass("_search-mode")
            this.input = null
        }

        if ((this.props.currentPage !== pages.search) && (prevProps.currentPage === pages.search)) {
            this._hideSearchString()
        }

        if ((this.props.currentPage === pages.search) && (prevProps.currentPage !== pages.search)) {
            this.setState({active : true, visible: true})
        }

        if (this.props.query !== prevProps.query) {

            if (this.input) {
                this.input.value = this.props.query
                this.forceUpdate()
            }

            setTimeout(() => {
                document.getElementById("search-input").focus()
            }, 0)
        }
    }

    render() {

        return this.state.active ?
            <div className={"search-string" + (this.state.visible ? " _visible" : "") + (this.state.hiding ? " _hiding" : "")}>
                <div className="wrapper">
                    <div className="svg-icon">
                        <svg width="16" height="16" dangerouslySetInnerHTML={{__html: SEARCH}}/>
                    </div>
                    <input ref={e => this.input = e} autoFocus={true} className="font-universal__body-medium" id="search-input" placeholder="Поиск по Магистерии" onKeyUp={::this._onKeyUp}/>
                    {
                        this.input && this.input.value &&
                            <div className="svg-icon _pointer clear" onClick={::this._clear}>
                                <svg width="18" height="18" dangerouslySetInnerHTML={{__html: CLOSE}}/>
                            </div>
                    }
                    <div className="svg-icon _pointer" onClick={::this._search}>
                        <svg width="18" height="18" dangerouslySetInnerHTML={{__html: ARROW}}/>
                    </div>
                </div>
            </div>
            :
            <li className={"header-menu__item"}>
            <div className="link-block" onClick={() => {this.setState({active: true})}}>
                <svg width="16" height="16" dangerouslySetInnerHTML={{__html: SEARCH}}/>
                { !this.props.isPhoneViewPort && <span className="item__title">Поиск</span> }
            </div>
        </li>
    }

    _hideSearchString() {
        const _isSearchPage = this.props.currentPage === pages.search

        if (!_isSearchPage || ($(window).width() < 900)) {
            this.setState({
                visible: false,
                hiding: true,
            })

            setTimeout(() => {
                this.setState({
                    active: false,
                    hiding: false,
                })
            }, 300)
        }
    }

    _onKeyUp(e) {
        if (e.keyCode === 13) {
            this._search()
        } else {
            this.forceUpdate()
        }
    }

    _search() {
        if (this.input && this.input.value) {
            this.props.actions.search({query: this.input.value})
            this.props.actions.hideMenu()
            OverflowHandler.turnOff();
        }
    }

    _clear() {
        if (this.input) {
            this.input.value = ""
            this.forceUpdate(() => { if (this.input) this.input.focus()})
        }
    }

    _addEventListeners() {
        document.body.addEventListener(this._touchEventName, this._handler)

        if (this._isTouchDevice) {
            $(window)
                .bind('touchmove', () => {
                    this._touchMoved = true;
                })
                .bind('touchstart', () => {
                    this._touchMoved = false;
                })
        }
    }

    _removeEventListeners() {
        document.body.removeEventListener(this._touchEventName, this._handler)
        if (this._isTouchDevice) {
            $(window).bind('touchmove')
            $(window).bind('touchstart')
        }
    }
}

const mapState2Props = (state) => {
    return {
        currentPage: state.pageHeader.currentPage,
        query: querySelector(state),
        isMobileApp: state.app.isMobileApp,
    }
}

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({search, hideMenu}, dispatch)
    }
}

export default connect(mapState2Props, mapDispatch2Props)(SearchItem)
