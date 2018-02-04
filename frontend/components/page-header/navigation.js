import React from 'react';
// import SvgFilter from '../../assets/images/svg/filter.svg';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as pageHeaderActions from "../../actions/page-header-actions";

class Navigation extends React.Component {

    // constructor() {
    //     super();
    //     this.state = {
    //         showForm: false
    //     }
    // }

    _switchShowFilterForm() {
        this.props.showFiltersForm ? this.props.pageHeaderActions.hideFiltersForm() : this.props.pageHeaderActions.showFiltersForm();
    }


    render() {
        const {isFull} = this.props;

        return (
            isFull ?
                <nav className="navigation">
                    <ul>
                        <li className="current">
                            <a>Курсы</a>
                        </li>
                        <li>
                            <a>Календарь</a>
                        </li>
                        <li className={"filter" + (this.props.showFiltersForm ? ' active' : '')} onClick={::this._switchShowFilterForm}>
                            <a>
                                <div width="22" height="21">
                                    <img src={'/assets/svg/filter.svg'}/>
                                </div>
                            </a>
                        </li>
                    </ul>
                </nav>
                :
                <nav className="navigation navigation-mobile">
                    <ul>
                        <li className="current">
                            <a href="#">Курсы</a>
                        </li>
                        <li>
                            <a href="#">Календарь</a>
                        </li>
                    </ul>
                </nav>

        )
    }
}

function mapStateToProps(state) {
    return {
        showFiltersForm: state.pageHeader.showFiltersForm,
        pageHeader: state.pageHeader,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        pageHeaderActions: bindActionCreators(pageHeaderActions, dispatch),
        // commonDlgActions : bindActionCreators(commonDlgActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Navigation);