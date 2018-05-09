const EventEmitter = require('events');

/**
 * @extends {EventEmitter}
 */
class Queue extends EventEmitter {

  /**
   * @constructor
   * @param {Number} interval The interval for the queue to be checked
   */
  constructor(interval) {
    super();

    if (!interval) throw new Error('No interval specified');
    /**
     * The interval for the queue cycle
     * @type {Number}
     */
    this.interval = interval;

    /**
     * Indicates the cooldown being active
     * @type {Boolean}
     */
    this.cooldown = false;

    /**
     * The queue for the requests to be finished
     * @type {Array<Requester>}
     */
    this.queue = new Array();

  }

  /**
   * Add a requester to the queue
   * @param {String|Number|Object} requester The requester to add to the queue
   * @returns {Boolean} Returns true if already in queue
   */
  add(requester) {
    if (this.contains(requester)) return true;
    this.queue.push(requester);
    if (this.task) return;
    this.emit('cycle', this.queue.shift());
    this.task = setInterval(() => {
      if (this.queue.length) this.emit('cycle', this.queue.shift());
      else {
        clearInterval(this.task);
        this.task = undefined;
      }
    }, this.interval);
  }

  /**
   * Check if a requester is in the queue
   * @param {String|Boolean|Object} requester The requester to check
   * @returns {Boolean} True if in the queue, false if not
   */
  contains(requester) {
    return this.queue.includes(requester);
  }

  /**
   * Remove a requester from the queue
   * @param {String|Number|Object} requester The requester to remove from the queue
   * @returns {Boolean} True if succesful, false if not
   */
  remove(requester) {
    const index = this.queue.indexOf(requester);
    if (index > -1) {
      this.queue.splice(index, 1);
      return true;
    } else return false;
  }

}
module.exports = Queue;
