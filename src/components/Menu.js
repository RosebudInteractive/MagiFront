/**
 * Created by levan.kiknadze on 11/11/2017.
 */

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as menuActions from "../actions/MenuActions";

class Menu extends Component {
    onMenuItemClick(id, url) {
        if (this.props.selected !== id) {
            this.props.menuActions.setSelected(id);
            this.props.history.push(url);
        }
    }

    render() {
        const {selected, items} = this.props;

        return <div className='main-menu'>
            {
                items.map((item) => {
                        return <div className="menu-item"
                                    key={item.id}
                                    onClick={() => {
                                        this.onMenuItemClick(item.id, item.url)
                                    }}>
                            <div className={"link" + (selected === item.id ? " open" : "")}>
                                {item.name}
                            </div>
                        </div>
                    }
                )
            }
        </div>
    }
}

function mapStateToProps(state, ownProps) {
    return {
        items: state.menu.items,
        selected: state.menu.selected,
        ownProps
    }
}


function mapDispatchToProps(dispatch) {
    return {
        menuActions: bindActionCreators(menuActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Menu)


