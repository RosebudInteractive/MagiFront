import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import LoadingPage from "../../components/common/loading-page";
import EditorForm from "../../components/author-editor";
import ErrorDialog from "../../components/dialog/error-dialog";

import {get, create} from "../../actions/authorActions"

const NEW_AUTHOR = {
    Id: null,
    FirstName: null,
    LastName: null,
    Description: null,
    ShortDescription: null,
}

class AuthorEditor extends React.Component{
    constructor(props) {
        super(props)

        this.state = {
            editMode: this.props.authorId > 0,
        }
    }

    componentDidMount() {
        const {authorId} = this.props

        if (this.state.editMode) {
            this.props.actions.get(authorId)
        } else {
            this.props.actions.create(NEW_AUTHOR)
        }
    }

    componentDidUpdate(prevProps, prevState) {
        let _needRefreshAfterSave = prevProps.saving && !this.props.saving && !this.props.hasError,
            _needSwitchToEditMode = !prevState.editMode && _needRefreshAfterSave

        if (_needSwitchToEditMode) {
            let _newRout = `/adm/authors/edit/${this.props.author.id}`;
            this.props.history.push(_newRout);
            this.setState({editMode: true})
        }

        if (_needRefreshAfterSave) {
            this.props.actions.get(this.props.author.id)
        }
    }

    render() {
        let {fetching,} = this.props

        return fetching ?
            <LoadingPage/>
            :
            <div className="editor author_editor">
                <EditorForm editMode={this.state.editMode}/>
                <ErrorDialog/>
            </div>
    }

}

const mapStateToProps = (state, ownProps) => {
    return {
        author: state.author.current,

        authorId: parseInt(ownProps.match.params.id),
        fetching: state.author.fetching,
        saving: state.author.saving,
        hasError: state.author.hasError,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        actions: bindActionCreators({get, create}, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AuthorEditor)