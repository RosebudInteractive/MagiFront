declare class Queue {
    private readonly queue;
    constructor();
    add(func: Function, oldValue: number, newValue: number, callback: Function): void;
    private dequeue;
    private exec;
}
declare const queue: Queue;
export default queue;
