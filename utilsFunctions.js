function timer(callback, delay) {
  var id, started, remaining = delay, _running;

  this.start = function() {
    _running = true;
    started = new Date();
    id = setTimeout(callback, remaining);
  };

  this.setRemainingTime = function (delay) {
    remaining = delay;
  };

  this.pause = function() {
    _running = false;
    clearTimeout(id);
    remaining -= new Date() - started;
  };

  this.getTimeLeft = function() {
    if (_running) {
      this.pause();
      this.start();
    }

    return remaining;
  };

  this.getStateRunning = function() {
    return _running;
  };

  this.start();
}