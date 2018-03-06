export const getTimeFmt = (time) => {
    let date = new Date(time * 1000),
        hh = date.getUTCHours(),
        mm = date.getUTCMinutes(),
        ss = date.getSeconds();

    return (hh ? (hh.toString() + ':') : '') +
        (hh ? mm.toString().padStart(2, '0') : mm.toString()) + ':' +
        ss.toString().padStart(2, '0')
};