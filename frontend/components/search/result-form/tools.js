export const ellipsisHighlightItem = ({item, fullText, isLastItem}) => {

    let _text = item.replace(/<.*?>/gi, ""),
        _started = fullText && (fullText.indexOf(_text) === 0),
        _withEllipsis = !!item.match(/\.{3,}$/g) || !!item.match(/…$/g),
        _withDot = !!item.match(/\.$/g)

    const _start = _started ? "" : "...",
        _end = isLastItem ?
            _withEllipsis ?
                ""
                :
                _withDot ?
                    ".."
                    :
                    "..."
            :
            ""

    return _start + item + _end
}

export const trimHighlight = (html) => {
    const _highlightBlock = html.match(/<em>.*?<\/em>/gim)

    if (_highlightBlock && _highlightBlock.length) {
        const _pos = html.indexOf(_highlightBlock[0])

        if (_pos < (html.length / 2)) {
            // return _trimLeft(html)
            return _trimRight(html)
        } else {
            return _trimLeft(html)
        }
    } else {
        return _trimRight(html)
    }
}

const _trimLeft = (html) => {
    let _text = html.replace(/^\.{3,}/, "")

    const _matches = _text.match(/^<([a-z,1,2,3]+)\s*[^>]*>/)
    if (_matches) {
        const _tag = _matches[1],
            _regexp = new RegExp(`^<${_tag}\\s.*?>(.*?)<\\/${_tag}>(.*?)$`)

        let _innerHTML = _text.match(_regexp)
        return _matches[0] + _trimLeft(_innerHTML[1]) + "</" + _tag + ">" + _innerHTML[2]
    } else {
        return "..." + _text.replace(/^\s*\S+\s/, "")
    }
}

const _trimRight = (html) => {
    let _text = html.replace(/\.{3,}$/, "")

    // const _matches = _text.match(/<([a-z,1,2,3]+)\s*[^>]*>/)
    const _matches = _text.match(/<\/([a-z,1,2,3]+)>$/)
    if (_matches) {
        const _tag = _matches[1],
            _regexp = new RegExp(`^(.*?)(<\\/${_tag}>)$`)

        let _innerHTML = _text.match(_regexp)
        return _trimRight(_innerHTML[1]) + _innerHTML[2]
    } else {
        return _text.replace(/\s\S+\s*$/, "") + "..."
    }
}
