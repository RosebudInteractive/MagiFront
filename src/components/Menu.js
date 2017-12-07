/**
 * Created by levan.kiknadze on 11/11/2017.
 */

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

// import { MENU_ITEM_EPISODES, MENU_ITEM_NONE } from "../constants/Menu"

export default class Menu extends Component {
    onMenuItemClick(id) {
        if (this.props.selected !== id)
            this.props.setSelected(id)
    }

    render() {
        const { selected, items } = this.props;

        return <div className='main-menu'>
            {
                items.map(
                    function (item) {
                        return <div className="menu-item" key={item.id}>
                            <div className={"link" + (selected === item.id ? " open" : "")}>
                                <Link to={{ pathname: item.url }} style={{textDecoration: 'none', color: '#333333'}}>
                                    {item.name}
                                </Link>
                            </div>
                        </div>
                    }
                )
            }
        </div>
    }
}

Menu.propTypes = {
    selected: PropTypes.string.isRequired,
    items: PropTypes.array.isRequired,
    setSelected: PropTypes.func.isRequired
};
