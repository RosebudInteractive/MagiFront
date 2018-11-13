import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom'

export default class Info extends React.Component {

    render() {
        let _multipleAuthors = this.props.authors.length > 1;
        let _multipleCategories = this.props.categories.length > 1;

        let _authors = this.props.authors.map((author, index, array) => {
            let _authorName = author.FirstName + ' ' + author.LastName;
            _authorName += (index !== array.length - 1) ? ',' : '';
            return (<Link to={'/autor/' + author.URL} key={index}>{_authorName}</Link>);
        });

        // _authors = (_authors.length > 1) ? <div>{_authors[0]},<br/> {_authors[1]}</div> : _authors

        const _categories = this.props.categories.map((category) => {
            return category.Name
        }).join('\n');

        return (
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
        );
    }
}

Info.propTypes = {
    authors: PropTypes.array.isRequired,
    categories: PropTypes.array.isRequired,
    showPhoto: PropTypes.bool,
};