import React from 'react'
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import LookupDialog from "../../LookupDialog";
import * as courseCategoriesActions from "../../../actions/course/courseCategoriesActions";

class CourseCategoryDialog extends React.Component {

    render() {
        return (

            this.props.showAddCategoryDialog ?
                <LookupDialog message='Категориии' data={::this._getCategories()}
                              yesAction={::this.props.courseCategoriesActions.add}
                              noAction={::this.props.courseCategoriesActions.hideAddDialog}/>
                : null
        )
    }

    _getCategories() {
        const {
            categories,
            courseCategories
        } = this.props;

        let _filtered = categories.filter((value) => {
            return !courseCategories.includes(value.id);
        });

        return _filtered.map((element) => {
            return {id: element.id, value: element.Name}
        })
    }

}


function mapStateToProps(state) {
    return {
        courseCategories: state.courseCategories.current,
        categories: state.categoriesList.categories,
        showAddCategoryDialog: state.courseCategories.showAddDialog,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        courseCategoriesActions: bindActionCreators(courseCategoriesActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CourseCategoryDialog);