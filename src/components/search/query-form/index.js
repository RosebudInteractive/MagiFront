import React from "react"
import PropTypes from "prop-types"
import "./query-form.sass"
import SearchLogo from '../../../../assets/svg/search.svg';

export default class QueryForm extends React.Component {

    static propTypes = {
        onSearch: PropTypes.func,
        isEmpty: PropTypes.bool,
    }

    constructor(props) {
        super(props)

        this.input = null
    }

    render() {
        return <div className={"query-control" + (this.props.isEmpty ? " _empty" : "")}>
            <input ref={e => this.input = e} className="query-control_input" placeholder="Введите запрос" autoFocus={true}/>
            <button className="query-control_search-button" onClick={::this._onSearch}>
                <img className="search-logo" src={SearchLogo}/>Найти
            </button>
        </div>
    }

    _onSearch() {
        if (this.props.onSearch && this.input && this.input.value) {
            this.props.onSearch(this.input.value)
        }
    }
}