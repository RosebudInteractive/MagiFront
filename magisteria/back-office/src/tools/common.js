const _getColor = () => {
    return "hsl(" + 360 * Math.random() + ',' +
        (55 + 45 * Math.random()) + '%,' +
        (50 + 10 * Math.random()) + '%)'
};


export default {
    getColor: _getColor()
}

