import * as Bull from 'bull';

type JobOptions = {
  attempts: number;
  backoff: {
    type: 'fixed' | 'exponential';
    delay: number;
  };
  removeOnComplete: boolean;
  removeOnFail: boolean;
};

export class BullService {
  private readonly jobOptions: JobOptions;
  private readonly concurrency: number;
  constructor(
    private queue: Bull.Queue,
    private processor: Bull.ProcessCallbackFunction<any>
  ) {
    this.jobOptions = {
      attempts: 5,
      backoff: {
        type: 'fixed',
        delay: 1000,
      },
      removeOnComplete: true,
      removeOnFail: true,
    };
    this.concurrency = 5;

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.queue.process(this.queue.name, this.concurrency, this.processor);
  }

  async addTask(taskData: any) {
    await this.queue.add(this.queue.name, taskData, this.jobOptions);
  }
}
