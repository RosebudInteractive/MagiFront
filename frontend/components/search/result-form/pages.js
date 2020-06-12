import React from "react"
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {pagesSelector, setPageNumber} from "ducks/search"

import "./result-form.sass"

class Pages extends React.Component {

    render() {
        const {count, currentPage} = this.props.pages

        if (count === 0) return null

        const _showNext = currentPage !== count

        return <div className="search-result__pages">
            {this._getList()}
            { _showNext && <button className={"page-button _next button _white"} onClick={::this._next}>Дальше</button> }
        </div>
    }

    _getList() {
        let _pages = [],
            _start = ((this.props.pages.currentPage + 2) <= (this.props.pages.count))
                ?
                this.props.pages.currentPage
                :
                this.props.pages.count - 2

        _start = _start - 2
        _start = _start < 1 ? 1 : _start

        let _last = ((_start + 4) >= (this.props.pages.count)) ? this.props.pages.count : _start + 4

        for (let i = _start; i <= _last; i++) {
            _pages.push(<button className={"page-button button" + (this.props.pages.currentPage === i ? " _brown" : " _white")} onClick={
                () => this.props.actions.setPageNumber(i)
            }>{i}</button>)
        }

        return _pages
    }

    _next() {
        this.props.actions.setPageNumber(this.props.pages.currentPage + 1)
    }
}

const mapStateToProps = (state) => {
    return {
        pages: pagesSelector(state)
    }
}

const mapStateToDispatch = (dispatch) => {
    return {
        actions: bindActionCreators({setPageNumber}, dispatch)
    }
}

export default connect(mapStateToProps, mapStateToDispatch)(Pages)
