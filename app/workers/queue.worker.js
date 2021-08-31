class QueueWorker {
  constructor() {
    this.queue = [];
    this.online = true;

    setInterval(() => {
      if(this.online) {
        this.processQueue();
      }
    }, 2000);
  }

  add(promise){
    this.queue.push({
      failed: 0,
      working: false,
      promise
    });
  }

  processQueue() {
    let i = this.queue.length;

    while(i--) {
      const task = this.queue[i];
      console.log(task)

      // if(task.failed > 4) {
      //   this.queue.splice(i, 1);
      // } else {

      if(!task.working) {
        task.working = true;
        task.promise()
          .then(() => {
            this.queue.splice(i, 1);
          })
          .catch(err => {
            task.working = false;
            task.failed += 1;
          });
      }

      // }
    }
  }
}

const instance = new QueueWorker();

module.exports = instance;
