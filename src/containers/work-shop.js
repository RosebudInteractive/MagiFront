import React from 'react';
import { connect } from 'react-redux';

class WorkShop extends React.Component {

    render() {
        return <div className="ws-container" style={!this.props.visible ? {display: 'none'} : null}/>
    }
}

function mapStateToProps(state) {
    return {
        visible: state.workShop.visible,
    }
}

export default connect(mapStateToProps)(WorkShop);