import React from 'react';
import PropTypes from 'prop-types';

export default class Info extends React.Component {

    render() {
        let _multipleAuthors = this.props.authors.length > 1;
        let _multipleCategories = this.props.categories.length > 1;

        let _authors = this.props.authors.map((author) => {
            return author.FirstName + ' ' + author.LastName;
        }).join(', ');

        const _categories = this.props.categories.map((category) => {
            return category.Name
        }).join('\n');

        const _portrait = this.props.authors[0] ? "/data/" + this.props.authors[0].Portrait : null;
        return (
            <div className='course-module__info'>
                <div className='course-module__info-col'>
                    {
                        this.props.showPhoto && !_multipleAuthors && _portrait ?
                            <div className='course-module__info-col-img'>
                                <img src={_portrait} width="59" height="59" alt=""/>
                            </div>
                            :
                                null

                    }
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