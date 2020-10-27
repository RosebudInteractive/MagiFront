import React, {useState, useEffect} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import "./top-message.sass"

function TopMessage(props) {
    return <div className="top-balloon-message">

    </div>
}

const mapState2Props = (state) => {
    return {}
}

const masDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({}, dispatch)
    }
}

export default connect(mapState2Props, masDispatch2Props)(TopMessage)