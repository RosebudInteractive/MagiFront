import React from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

class Authors extends React.Component {
    componentDidMount(){
        this.props.authorActions.getAuthors();
    }
}

function mapStateToProps(state) {
    return {

    }
}

function mapDispatchToProps(dispatch) {
    return {
        episodesActions: bindActionCreators(episodesActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Authors);