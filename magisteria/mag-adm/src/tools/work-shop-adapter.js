export const convertAssetsToContent = (data) => {
    let result = [];
    if (!data || !data.episodes || data.episodes.length === 0) {
        return result
    }

    let _episode = data.episodes[0];
    _episode.elements.forEach((element) => {
        let _content = {
            CompType:"PIC",
            Content: JSON.stringify(element.content),
            Description:element.content.title2,
            Duration: Math.round(element.content.duration * 1000),
            FileName: _getFileName(data.assets, element.assetId),
            Id: element.id,
            Name:element.content.title,
            ResType:"P",
            ResourceId: element.assetId,
            StartTime: Math.round(element.start * 1000),
        }

        result.push(_content)
    })

    return result;
}

const _getFileName = (assets, id) => {
    let _asset = assets.find((item) => {
        return item.id === id
    })

    return _asset ? _asset.file : null
}