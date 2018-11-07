import React from "react";
import {connect} from "react-redux";
import {authorSelector} from '../../ducks/author'
import {getAuthorPortraitPath, ImageSize} from "../../tools/page-tools";


class AuthorBlock extends React.Component {

    constructor(props) {
        super(props);

        this._resizeHandler = (e) => {
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
                            <h2 className="author-block__name">{author.FirstName + ' ' + author.LastName}</h2>
                            <p className="author-block__descr">{author.Description}</p>
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