export class PromiseQueue {
  private queue: Array<() => Promise<unknown>> = [];
  private isProcessing = false;

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        try {
          await task();
        } catch (error) {
          console.error("PromiseQueue task error:", error);
        }
      }
    }

    this.isProcessing = false;
  }

  async enqueue<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(() => task().then(resolve).catch(reject));

      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }
}
