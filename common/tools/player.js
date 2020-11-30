import {getTimeFmt} from "tools/time-tools";

export const calcContent = (content) => {
    let _length = 0;
    let _items = [];
    content.forEach((episodeContent) => {
        _length += episodeContent.duration;

        episodeContent.content.forEach((item) => {
            _items.push({id: item.id, title: item.title, begin: item.begin, episodeTitle: episodeContent.title})
        })
    });

    let _total = getTimeFmt(_length);

    return {
        totalDurationFmt: _total,
        totalDuration: _length,
        content: _items,
    }
}