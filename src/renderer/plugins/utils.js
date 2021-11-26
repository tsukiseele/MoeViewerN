Object.forEach = function(self, callback) {
  self && callback && Object.entries(self).forEach(([k, v]) => callback(k, v));
};

/*
Object.prototype.forEach = function(callback) {
  this && callback && Object.entries(this).forEach(([k, v]) => callback(k, v));
};*/