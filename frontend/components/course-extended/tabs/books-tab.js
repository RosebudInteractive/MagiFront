import React from "react";
import PropTypes from "prop-types"

export default class BooksTab extends React.Component {

    static propTypes = {
        total: PropTypes.number,
        active: PropTypes.bool
    }

    render() {
        return (
            <li className={'course-tab-control' + (this.props.active ? ' active' : '')} disabled={!this.props.total}>
                <span className="course-tab-control__title _desktop">Список для чтения:</span>
                <span className="course-tab-control__title _mobile">Книги</span>
                {
                    this.props.total ?
                        <div>
                            <span className="course-tab-control__actual">{this.props.total + ' '}</span>
                            <span className="course-tab-control__label">книги</span>
                        </div>
                        :
                        <div className='course-tab-control__empty-container'>
                            <span className="course-tab-control__empty _desktop">пока пуст</span>
                            <span className="course-tab-control__empty _mobile">0</span>
                        </div>
                }
            </li>
        )
    }
}