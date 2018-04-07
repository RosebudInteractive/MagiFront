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

export const getSize = (width) => {
// export const getSize = () => {
    let _size = Object.keys(Size).find((item) => {
        return width > Size[item].width
    });

    // let _size = Size.xl;

    if (!_size) {
        _size = Size.mobile;
    } else {
        _size = Size[_size]
    }

    return _size;
};

export function widerThan(size) {
    return this ? (this.width >= size.width) : false;
}

export function narrowerThan(size) {
    return this ? (this.width < size.width) : false;
}

export function widthBetween(min, max) {
    return this ? (this.narrowerThan(max) && this.widerThan(min)) : false
}

export function isMobile() {
    return (this && this.props.size) ? (this.props.size.width < Size.s.width) : false
}

export const pages = {
    courses: {name: 'courses', url: '/'},
    singleCourse: {name: 'singleCourse', url: null},
    lesson: {name: 'lesson', url: null},
    player: {name: 'player', url: null},
    transcript: {name: 'transcript', url: null},
}