import React, {useEffect,} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from "redux";
import AppRouter from "./route";
// import {whoAmI} from "tt-ducks/auth";
// import {getAllDictionaryData} from "tt-ducks/dictionary";

function App(props) {

    useEffect(() => {
        const _params = new URLSearchParams(this.props.location.search),
            _token = _params.get('token')

        if (_token) {
            _params.delete('token')
            this.props.history.replace({
                search: _params.toString(),
            })
        }

        this.props.getAppOptions(_token)
    }, [])


    return <div>
        <AppRouter/>
    </div>
}

const mapStateToProps = (state) => {
    return {}
}

const mapDispatchToProps = (dispatch) => {
    return {
        actions: bindActionCreators({}, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
