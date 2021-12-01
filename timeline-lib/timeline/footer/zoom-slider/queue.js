class Queue {
    queue;
    constructor() {
        this.queue = [];
    }
    add(func, oldValue, newValue, callback) {
        this.queue.push({ func, args: { oldValue, newValue, callback } });
        if (this.queue.length === 1) {
            this.exec();
        }
    }
    dequeue() {
        this.queue.shift();
        this.exec();
    }
    exec() {
        if (this.queue.length > 0) {
            const { func, args } = this.queue[0];
            func(...Object.values(args), this.dequeue.bind(this));
        }
    }
}
const queue = new Queue();
export default queue;
