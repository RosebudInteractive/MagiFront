import React from 'react';
// import img1 from '../../assets/images/bg-lecture01.png';
// import img2 from '../../assets/images/bg-lecture01@2x.png';

export default class InfoBlock extends React.Component {

    _getClassName() {
        let _name = 'course-module__image-block';
        this.props.size.forEach((size) => {
            _name = _name + ' image-block-' + size
        });

        return _name;
    }

    _getImageClassName() {
        let _name = 'course-module__image';
        this.props.size.forEach((size) => {
            _name = _name + ' image-' + size
        });

        return _name;
    }


    render() {
        // const {size, title} = this.props;
        return (
            <div className={this._getClassName()}>
                <img className={this._getImageClassName()}
                     src={'./data/images/bg-lecture01.png'}
                     // src={"=('images/bg-lecture01.png') %>"}
                     srcSet={"<%= asset_url('images/bg-lecture01@2x.png') %>"}
                    // width="662"
                    // height="680"
                     alt=""/>
            </div>
        );
    }
}