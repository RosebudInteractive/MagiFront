import React from 'react';

export const Size = {
    xxl: {width: 1900, name: 'xxl-size'},
    xl: {width: 1400, name: 'xl-size'},
    l: {width: 1280, name: 'l-size'},
    m: {width: 1024, name: 'm-size'},
    s: {width: 900, name: 's-size'},
    xs: {width: 768, name: 'xs-size'},
    xxs: {width: 640, name: 'xxs-size'},
    mobile: {width: 500, name: 'mobile'}
};

export default class ResizeComponent extends React.Component {

    _getClassName(baseName, sizePrefix) {
        let _name = baseName;

        let _prefix = sizePrefix ? sizePrefix : baseName;

        this.props.size.forEach((size) => {
            _name = _name + ' ' + _prefix + '-' + size
        });

        return _name;
    }

    _isSize(size) {
        return this.props.size.includes(size.name)
    }

    _widerThan(size) {
        return this.props.width >= size.width;
    }

    _narrowerThan(size) {
        return this.props.width < size.width;
    }

    _widthBetween(min, max) {
        return this._narrowerThan(max) && this._widerThan(min)
    }
}