import React from "react"
import {querySelector, search} from "ducks/search";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {pages} from "tools/page-tools";
// import {Link} from "react-router-dom";

const SEARCH = '<use xlink:href="#search"/>',
    ARROW = '<use xlink:href="#next"/>',
    CLOSE = '<use xlink:href="#close-no-color"/>'

class SearchItem extends React.Component{

    constructor(props) {
        super(props)

        this.state = {
            active: false,
            visible: false,
        }

        this.input = null

        this._handler = (e) => {
            const _isSearch = e.target.closest('.search-string')

            if (this.state.active && !_isSearch) {
                this._hideSearchString()
            }
        }
    }

    componentDidMount() {
        document.body.addEventListener("mouseup", this._handler)
    }

    componentWillUnmount() {
        document.body.removeEventListener("mouseup", this._handler)
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
    }

    render() {

        return this.state.active ?
            <div className={"search-string" + (this.state.visible ? " _visible" : "")}>
                <div className="wrapper">
                    <div className="svg-icon">
                        <svg width="16" height="16" dangerouslySetInnerHTML={{__html: SEARCH}}/>
                    </div>
                    <input ref={e => this.input = e} className="font-universal__body-medium" id="search-input" placeholder="Поиск по Магистерии" onKeyUp={::this._onKeyUp}/>
                    <div className="svg-icon _pointer close" onClick={::this._close}>
                        <svg width="18" height="18" dangerouslySetInnerHTML={{__html: CLOSE}}/>
                    </div>
                    <div className="svg-icon _pointer" onClick={::this._search}>
                        <svg width="18" height="18" dangerouslySetInnerHTML={{__html: ARROW}}/>
                    </div>
                </div>
            </div>
            :
            <li className={"header-menu__item"}>
            <div className="link-block" onClick={() => {this.setState({active: true})}}>
                <svg width="16" height="16" dangerouslySetInnerHTML={{__html: SEARCH}}/>
                <span className="item__title">Поиск</span>
            </div>
        </li>
    }

    _hideSearchString() {
        const _isSearchPage = this.props.currentPage === pages.search

        if (!_isSearchPage) {
            this.setState({
                active: false,
                visible: false,
            })
        }
    }

    _onKeyUp(e) {
        if (e.keyCode === 13) this._search()
    }

    _search() {
        if (this.input && this.input.value) {
            this.props.actions.search({query: this.input.value})
        }
    }

    _close() {
        this.setState({
            active: false,
            visible: false,
        })
    }
}

const mapState2Props = (state) => {
    return {
        currentPage: state.pageHeader.currentPage,
        query: querySelector(state),
    }
}

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({search}, dispatch)
    }
}

export default connect(mapState2Props, mapDispatch2Props)(SearchItem)
