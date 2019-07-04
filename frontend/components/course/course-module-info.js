import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom'

export default class Info extends React.Component {

    static propTypes = {
        authors: PropTypes.array.isRequired,
        categories: PropTypes.array.isRequired,
        showPhoto: PropTypes.bool,
        isLineStyle: PropTypes.bool,
    };

    render() {
        let _multipleAuthors = this.props.authors.length > 1;
        let _multipleCategories = this.props.categories.length > 1;

        let _authors = this.props.authors.map((author, index, array) => {
            let _authorName = author.FirstName + ' ' + author.LastName;
            _authorName += (index !== array.length - 1) ? ',' : '';
            return (<Link to={'/autor/' + author.URL} key={index}>{_authorName}</Link>);
        });

        const _categories = this.props.categories.map((category) => {
            return category.Name
        }).join('\n');

        return this.props.isLineStyle
            ?
            <div className="course-module__info">
                <div className="course-module__stats">
                    <b className="category">{_categories}</b>
                    {" / "}
                    <span className="author-name">{_authors}</span>
                </div>
            </div>
            :
            <div className='course-module__info'>
                <div className='course-module__info-col'>
                    <p className='course-module__info-col-header'>{_multipleAuthors ? 'Авторы' : 'Автор'}</p>
                    <p className='course-module__info-col-descr'>{_authors}</p>
                </div>
                <div className='course-module__info-col'>
                    <p className='course-module__info-col-header'>{_multipleCategories ? 'Категории' : 'Категория'}</p>
                    <p className='course-module__info-col-descr'>{_categories}</p>
                </div>
            </div>
    }
}