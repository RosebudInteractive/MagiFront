type Args = { oldValue: number, newValue: number, callback: Function };
type QueueItem = { func: Function, args: Args };

class Queue {
  private readonly queue: QueueItem[];

  constructor() {
    this.queue = [];
  }

  add(func: Function, oldValue: number, newValue: number, callback: Function) {
    this.queue.push({ func, args: { oldValue, newValue, callback } });

    if (this.queue.length === 1) {
      this.exec();
    }
  }

  private dequeue() {
    this.queue.shift();
    this.exec();
  }

  private exec() {
    if (this.queue.length > 0) {
      const { func, args } = this.queue[0];

      func(...Object.values(args), this.dequeue.bind(this));
    }
  }
}

const queue = new Queue();
export default queue;
