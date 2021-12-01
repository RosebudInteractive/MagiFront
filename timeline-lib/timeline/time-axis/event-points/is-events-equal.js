export default function isEventsEqual(source, dest) {
    return source.length === dest.length && source.every((event) => {
        const destEvent = dest.find((item) => item.id === event.id);
        return !!destEvent && destEvent === event;
    });
}
