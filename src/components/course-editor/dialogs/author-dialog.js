import React from 'react'
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import LookupDialog from "../../LookupDialog";
import * as courseAuthorsActions from "../../../actions/course/courseAuthorsActions";

class CourseAuthorDialog extends React.Component {

    render() {
        return (
            this.props.showAddAuthorDialog ?
                <LookupDialog message='Авторы' data={::this._getAuthorsList()}
                              yesAction={::this.props.courseAuthorsActions.add}
                              noAction={::this.props.courseAuthorsActions.hideAddDialog}/>
                : null
        )
    }

    _getAuthorsList() {
        const {
            authors,
            courseAuthors
        } = this.props;


        let _filtered = authors.filter((value) => {
            return !courseAuthors.includes(value.id);
        });

        return _filtered.map((element) => {
            return {id: element.id, value: element.FirstName + ' ' + element.LastName}
        })
    }

}


function mapStateToProps(state) {
    return {
        showAddAuthorDialog: state.courseAuthors.showAddDialog,
        courseAuthors: state.courseAuthors.current,
        authors: state.authorsList.authors,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        courseAuthorsActions: bindActionCreators(courseAuthorsActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CourseAuthorDialog);