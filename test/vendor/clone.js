// http://stackoverflow.com/a/122190/1486679

module.exports = function clone(obj) {
  if(obj === null || typeof(obj) !== 'object')
    return obj;

  var temp = obj.constructor(); // changed

  for(var key in obj) {
    if(Object.prototype.hasOwnProperty.call(obj, key)) {
      temp[key] = clone(obj[key]);
    }
  }
  return temp;
};
