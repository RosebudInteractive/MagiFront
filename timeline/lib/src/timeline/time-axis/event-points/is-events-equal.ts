import { Event } from '../../../types/event';

export default function isEventsEqual(
  source: Event.VisualItem[],
  dest: Event.VisualItem[],
): boolean {
  return source.length === dest.length && source.every((event: Event.VisualItem) => {
    const destEvent = dest.find((item: Event.VisualItem) => item.id === event.id);
    return !!destEvent && destEvent === event;
  });
}
