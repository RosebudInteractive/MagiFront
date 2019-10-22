import React from "react";
import {connect} from "react-redux";
import {pages} from "tools/page-tools";

class FilterBlock extends React.Component {

    render() {
        const _isCoursePage = this.props.currentPage === pages.courses

        return _isCoursePage &&
            <React.Fragment>
                <li className={"header-menu__item" + (this.props.currentPage === pages.bookmarks ? ' active' : '')}>
                    <span className="item__title">Теория</span>
                </li>
                <li className={"header-menu__item" + (this.props.currentPage === pages.bookmarks ? ' active' : '')}>
                    <span className="item__title">Практика</span>
                </li>
            </React.Fragment>
    }
}

function mapStateToProps(state) {
    return {
        currentPage: state.pageHeader.currentPage,
    }
}

export default connect(mapStateToProps,)(FilterBlock)