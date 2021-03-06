import React from "react";
import {connect} from "react-redux";
import {authorSelector} from 'ducks/author'
import $ from 'jquery'
import {getAuthorPortraitPath, ImageSize} from "tools/page-tools";
import CourseBooksList from "../books/course-books-list";
import Books from "../books";
import "./author.sass"

class AuthorBlock extends React.Component {

    constructor(props) {
        super(props);

        this._resizeHandler = () => {
            let _image = $('.author-block__image');

            _image.innerHeight(_image.innerWidth() * 1.16)
        }
    }

    componentDidMount() {
        $(window).on('resize', this._resizeHandler);
        this._resizeHandler();
    }

    componentWillUnmount() {
        $(window).unbind('resize', this._resizeHandler)
    }

    render() {
        let {author} = this.props;

        let _portrait = getAuthorPortraitPath(author, ImageSize.medium);

        return (
            <div className="author-block">
                <div className="author-block__inner">
                    <div className="author-block__col">
                        <div className="author-block__image">
                            <img src={_portrait} alt=""/>
                        </div>
                    </div>
                    <div className="author-block__col">
                        <div className="author-block__info">
                            <h1 className="author-block__name">{author.FirstName + ' ' + author.LastName}</h1>
                            <p className="author-block__descr" dangerouslySetInnerHTML={{__html: author.Description}}/>
                            <Books books={author.Books} titleClassName={"books__title"} extClass={"_vertical"} listClass={CourseBooksList}/>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        author: authorSelector(state),
    }
}

export default connect(mapStateToProps)(AuthorBlock);