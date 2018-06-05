import React from "react";
import {connect} from "react-redux";
import {authorSelector} from '../../ducks/author'

class AuthorBlock extends React.Component {

    render() {
        let {author} = this.props;

        let _portrait = author ? (
            (author.PortraitMeta && author.PortraitMeta.content) ?
                (
                    author.PortraitMeta.content.m ?
                        author.PortraitMeta.content.m
                        :
                        null
                ) : null
        ) : null;

        _portrait = '/data/' + (_portrait ? (author.PortraitMeta.path + _portrait) : author.Portrait);

        return (
            <div className="author-block">
                <div className="author-block__inner">
                    <div className="author-block__col">
                        <div className="author-block__image">
                            <img src={_portrait} width="583" height="884" alt=""/>
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