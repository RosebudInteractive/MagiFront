import React from 'react';
import SvgSearch from '../../assets/images/svg/search.svg'
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
                    <button type="button" className="search-block__trigger">
                        <div width="20" height="21">
                            <img src={SvgSearch} onClick={that._showForm.bind(this)}/>
                        </div>
                    </button>

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