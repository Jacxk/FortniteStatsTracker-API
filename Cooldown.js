class Cooldown {

  /**
   * @constructor
   * @param {Number} [cooldown] The standard cooldown time in ms
   * @param {Number} [interval=500] The interval time in ms
   */
  constructor(cooldown, interval = 500) {

    /**
     * @type {Number} The standard cooldown in ms
     */
    this.cooldown = cooldown;

    /**
     * @type {Number} The interval time in ms
     */
    this.interval = interval;

    /**
     * @type {Map<Key, Time>} The map with the cooldowns
     */
    this.list = new Map();

    /**
     * The performance node class
     */
    this.performance = require('perf_hooks').performance;

    setInterval(() => {
      for (const [key, time] of this.list) {
        if (time < this.performance.now()) {
          this.list.delete(key);
        }
      }
    }, this.interval);

  }

  /**
   * Adds a key to the cooldown
   * @param {String|Number|Object} key The key to apply the cooldown to
   * @param {Number} [time=this.cooldown] The time of the cooldown in ms
   */
  add(key, time = this.cooldown) {
    if (!time) throw new Error('No cooldown specified');
    this.list.set(key, this.performance.now() + time);
  }

  /**
   * Checks if there is a cooldown active on the key provided
   * @param {String|Number|Object} key The key to check for
   * @returns {Boolean} True if cooldown is active, false if not
   */
  active(key) {
    return this.list.has(key);
  }

  /**
   * Remove a key from the cooldown
   * @param {String|Number|Object} key The key to remove
   * @returns {Boolean} True if key was deleted succesfully, false if not
   */
  remove(key) {
    return this.list.delete(key);
  }

}
module.exports = Cooldown;
