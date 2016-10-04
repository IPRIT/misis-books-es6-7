import uuid from 'uuid';

export default class UserZone {
  
  constructor(ip = "", quantum = 5 * 1000) {
    this._ip = ip;
    this._quantum = quantum;
    this.init();
  }
  
  init() {
    this._uuid = uuid.v1();
    this._counter = 0;
    this._firstActivityTimeMs = new Date().getTime();
  }
  
  getId() {
    return this._uuid;
  }
  
  getAddress() {
    return this._ip;
  }
  
  getFirstActivityTimeMs() {
    return this._firstActivityTimeMs;
  }
  
  getCounter() {
    let currentTime = new Date().getTime();
    if (this.getFirstActivityTimeMs() + this._quantum > currentTime) {
      return this._counter;
    }
    this.reset();
    return this._counter;
  }
  
  reset() {
    this._counter = 0;
    this._firstActivityTimeMs = new Date().getTime();
  }
  
  increment() {
    this._counter++;
  }
  
  decrease() {
    this._counter = Math.max(0, this._counter - 1);
  }
  
  dispose() {
    for (let key in this) {
      if (key === 'dispose' || !this.hasOwnProperty(key)) {
        continue;
      }
      delete this[ key ];
    }
  }
}
