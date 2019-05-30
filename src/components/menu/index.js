import React from 'react';
import PropTypes from 'prop-types';
import './menu.sass'

const items = [
    {id: 'authors', name: "Авторы", url:'/adm/authors'},
    {id: 'categories', name : 'Категории' , url : '/adm/categories'},
    {id: 'courses', name : 'Курсы' , url : '/adm/courses'},
    {id: 'books', name : 'Книги' , url : '/adm/books'},
    {id: 'promos', name : 'Промокоды' , url : '/adm/promos'},
]

export default class Menu extends React.Component {

    static propTypes = {
        history: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props)

        this.state = {
            selected : null
        }
    }

    componentDidMount() {
        if (!this.state.selected) {
            items.some((item) => {
                if (this.props.location.pathname.startsWith(item.url, 0)) {
                    this.setState({selected : item.id});
                    return true
                } else {
                    return false
                }
            })
        }
    }

    render() {
        return <div className='main-menu'>
            {this._getItems()}
        </div>
    }

    _getItems() {
        return items.map((item) => {
                return <div className="menu-item"
                            key={item.id}
                            onClick={() => {
                                this._onMenuItemClick(item.id, item.url)
                            }}>
                    <div className={"link" + (this.state.selected === item.id ? " selected" : "")}>
                        {item.name}
                    </div>
                </div>
            }
        )
    }

    _onMenuItemClick(id, url) {
        if (this.state.selected !== id) {
            this.setState({selected : id});
        }

        if (this.props.location.pathname !== url) {
            this.props.history.push(url);
        }
    }
}

