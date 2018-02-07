import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as pageHeaderActions from "../../actions/page-header-actions";

class SearchBlock extends React.Component {

    constructor() {
        super();
        this.state = {
            showForm: false
        }
    }

    _showForm() {
        this.props.pageHeaderActions.showSearchForm()
    }

    _hideForm() {
        this.props.pageHeaderActions.hideSearchForm();
    }

    render() {
        let that = this;
        let _className = 'search-block' + (this.props.showSearchForm ? ' opened' : '');

        return (
                <div className={_className} >
                    <div type="button" className="search-block__trigger">
                        <div width="20" height="21">
                            <svg width="20" height="21" onClick={that._showForm.bind(this)}>
                                <svg id="search" viewBox="0 0 20 21" width="100%" height="100%"><title>Component</title>
                                    <g>
                                        <path id="search-a" fillRule="evenodd"
                                              d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm0-2A6 6 0 1 0 8 2a6 6 0 0 0 0 12z"/>
                                    </g>
                                    <g transform="rotate(-45 21.692 -6.571)">
                                        <path id="search-b" d="M0 0h2v10.466H0V0z"/>
                                    </g>
                                </svg>
                            </svg>
                        </div>
                    </div>

                    {
                        this.props.showSearchForm ?
                            <form className="search-form">
                                <input type="search" className="search-form__field js-search-field" placeholder="Поиск"/>
                                <button className="invisible" onClick={this._hideForm.bind(this)}>Найти</button>
                                <div className="search-form__close" onClick={this._hideForm.bind(this)}>Закрыть</div>
                            </form>
                            :
                            ""
                    }
                </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        showSearchForm: state.pageHeader.showSearchForm,
        pageHeader: state.pageHeader,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        pageHeaderActions: bindActionCreators(pageHeaderActions, dispatch),
        // commonDlgActions : bindActionCreators(commonDlgActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchBlock);