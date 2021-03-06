/**
 * Created by levan.kiknadze on 22/11/2017.
 */

import React, {Component} from 'react';
import ReactDOM from 'react-dom';

import * as webix from 'webix/webix.js';

class Webix extends Component {
    render() {
        return (
            <div ref="root"></div>
        );
    }

    setWebixData(data) {
        const ui = this.ui;
        if (ui.setValues) {
            ui.setValues(data);
        } else if (ui.parse) {
            ui.clearAll();
            ui.parse(data);
            ui.refresh()
        } else if (ui.setValue) {
            ui.setValue(data);
        }
    }

    componentWillUnmount() {
        this.ui.destructor();
        this.ui = null;
    }

    UNSAFE_componentWillUpdate(props) {
        if (props.data)
            this.setWebixData(props.data);
        if (props.select)
            this.select(props.select);
    }

    componentDidMount() {
        this.ui = webix.ui(
            this.props.ui,
            ReactDOM.findDOMNode(this.refs.root)
        );

        this.UNSAFE_componentWillUpdate(this.props);
    }

}

export default Webix;