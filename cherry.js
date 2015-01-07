//   cherry.js 0.1.7
//   http://cherryjs.com
//   (c) 2013-2015 Jerry Zou
//   Under the MIT license

((function () {
  var root = this;
  var $C, CherryJs;

  CherryJs = function (func) {
    var result;

    if (typeof(func)==="function") {
      bind();
      result = func();
      unbind();
    }

    return result;
  };

  $C = CherryJs;

  // Export the Cherry.js object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `$C` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = CherryJs;
    }
    exports.$C = exports.CherryJs = CherryJs;
  } else {
    root.$C = root.CherryJs = CherryJs;
  }

  // Error Types
  var Exception = function(message) {
    this.message = message;
  };

  Exception.prototype.toString = function() {
    return this.message;
  };

  var bindList = {
    object: {
      methods: [ 
        '$clone', '$equal', '$in',
        '$isArray', '$isRing'
      ],
      functionContainer: {},
      proto: Object.prototype
    },
    array: {
      methods: [
        '$clone', '$equal', '$swap',
        '$intersect', '$unite', '$isRing'
      ],
      functionContainer: {},
      proto: Array.prototype
    },
    number: {
      methods: [ '$clone', '$equal', '$isRing' ],
      functionContainer: {},
      proto: Number.prototype
    },
    bool: {
      methods: [ '$clone', '$equal', '$isRing' ],
      functionContainer: {},
      proto: Boolean.prototype
    },
    string: {
      methods: [ '$clone', '$equal', '$removeSpace', '$trim', '$isRing' ],
      functionContainer: {},
      proto: String.prototype
    },
    regexp: {
      methods: [ '$clone', '$equal', '$isRing' ],
      functionContainer: {},
      proto: RegExp.prototype
    },
    date: {
      methods: [ '$clone', '$equal', '$isRing' ],
      functionContainer: {},
      proto: Date.prototype
    }
  };

  //bind methods to prototypes
  var bind = function () {
    //if some methods has been defined, move them to functionContainer.
    for (var name in bindList) {
      for (var i=0; i < bindList[name].methods.length; i++) {
        var methodName = bindList[name].methods[i];
        if (bindList[name].proto[methodName]) {
          bindList[name].functionContainer[methodName] = bindList[name].proto[methodName];
        } 
      }
    }

    /*=====================================*
     * Object.prototype *
     *=====================================*/

    Object.defineProperties(Object.prototype, {
      "$clone": {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (objectStack) {
          var obj = {};
          objectStack = objectStack || [];
          objectStack.push(this);

          for (var attr in this) {
            if (this.hasOwnProperty(attr)) {
              if (typeof(this[attr]) !== "function") {
                if (this[attr] === null) {
                  obj[attr] = null;
                }
                else {
                  if (objectStack.indexOf(this[attr]) > 0) {
                    throw 'Cyclic Object';
                  }
                  obj[attr] = this[attr].$clone(objectStack);
                }
              }
            }
          }
          return obj;
        }
      },

      "$equal": {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (obj, noRing) {
          if (!obj) {
            return false;
          }
          console.log(noRing);
          if (!noRing && this.$isRing() || obj.$isRing()) {
            throw new Exception('Error 12001: Cannot call $equal on a object which contains a ring.');
          } else {
            noRing = true;
          }

          for (var attr in this) {
            if (this.hasOwnProperty(attr) && obj.hasOwnProperty(attr)) {
              if (typeof(this[attr]) !== "function") {
                if (typeof(this[attr]) === "object") {
                  if (this[attr] === null && obj[attr] === null) { }
                  else {
                    if ((this[attr] !== null && obj[attr] === null)|| (this[attr] === null && obj[attr] !== null)){ 
                      return false; 
                    }
                    else {
                      if (!this[attr].$equal(obj[attr], noRing)) {
                        return false;
                      }
                    }
                  }
                } else {
                  if (this[attr] !== obj[attr]) {
                    return false;
                  }
                }
              }
            }
            else {
              if (typeof(this[attr]) !== "function") {
                return false;
              }
            }
          }
          return true;
        }
      },

      "$isArray": {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function () {
          return Object.prototype.toString.call(this.valueOf()) === '[object Array]' ? true : false;
        }
      },

      "$in": {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (arr) {
          if (arr && arr.$isArray()) {
            for (var i = 0; i < arr.length; i++) {
              if (arr[i] === this.valueOf()) {
                return true;
              }
            }
          }
          else {
            console.warn('Warning 11001: the argument of Object.$in() is not an array.');
          }
          return false;
        }
      },

      "$isRing": {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (list) {
          list = list || [];
          //judge if this object has been in list
          for (var i = 0; i < list.length; i++) {
            if (this === list[i]) {
              return true;
            }
          }
          list.push(this);
          for (var prop in this) {
            if (this.hasOwnProperty(prop) && this[prop].$isRing(list)) {
              return true;
            }
          }
          return false;
        }
      },

    });

    /*=====================================*
     * Array.prototype *
     *=====================================*/

    Object.defineProperties(Array.prototype, {
      "$clone": {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (objectStack) {
          var thisArr = this.valueOf();
          var newArr = [];
          for (var i=0; i<thisArr.length; i++) {
            newArr.push(thisArr[i].$clone(objectStack));
          }
          return newArr;
        }
      },

      "$equal": {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (arr, noRing) {
          var me = this.valueOf();
          if (me.length !== arr.length) {
            return false;
          }
          for (var i=0; i<me.length; i++) {
            if (me[i] !== undefined && arr[i] === undefined) {
              return false;
            } else if (me[i] === undefined && arr[i] !== undefined) {
              return false;
            } else if (me[i] !== undefined && arr[i] !== undefined) {
              if (!me[i].$equal(arr[i], noRing)) {
                return false;
              }
            }
          }
          return true;
        }
      },

      "$swap": {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (index1, index2) {
          var me = this.valueOf();
          if (index1 === index2) {
            return this;
          }
          if (index1 < 0 || index1 >= me.length) {
            console.warn('Warning 21001: the argument index1 of Array.$swap(index1, index2) is out of range.');
            return this;
          }
          if (index2 < 0 || index2 >= me.length) {
            console.warn('Warning 21002: the argument index2 of Array.$swap(index1, index2) is out of range.');
            return this;
          }
          var tmp = me[index1];
          me[index1] = me[index2];
          me[index2] = tmp;
          return this;
        }
      },

      "$intersect": {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (arr) {
          var me = this.valueOf();
          var result = [];
          for (var i = 0; i < me.length; i++) {
            if (me[i].$in(arr) && !me[i].$in(result)) {
              result.push(me[i]);
            }
          }
          return result;
        }
      },

      "$unite": {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (arr) {
          var me = this.valueOf();
          var result = [];
          if (!arr) {
            return me;
          }
          for (var i = 0; i < me.length; i++) {
            if (!me[i].$in(result)) {
              result.push(me[i]);
            }
          }
          for (i = 0; i < arr.length; i++) {
            if (!arr[i].$in(result)) {
              result.push(arr[i]);
            }
          }
          return result;
        }
      },

      "$isRing": {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function(list) {
          var me = this.valueOf();
          list = list || [];

          for (var i = 0; i < me.length; i++) {
            if (me[i] && me[i].$isRing(list)) {
              return true;
            }
          }
          return false;
        }
      }
    });

    /*=====================================*
     * Number.prototype *
     *=====================================*/

    Object.defineProperties(Number.prototype, {
      "$clone": {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function() { return this.valueOf(); }
      },

      "$equal": {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function(num) { return this.valueOf() === num; }
      },

      "$isRing": {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function() {
          return false;
        }
      }
    });

    /*=====================================*
     * Boolean.prototype *
     *=====================================*/

    Object.defineProperties(Boolean.prototype, {
      "$clone": {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function() { return this.valueOf(); }
      },

      "$equal": {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function(bool) { return this.valueOf() === bool; }
      },

      "$isRing": {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function() {
          return false;
        }
      }
    });

    /*=====================================*
     * String.prototype *
     *=====================================*/

    Object.defineProperties(String.prototype, {
      "$clone": {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function() { return this.valueOf(); }
      },

      "$equal": {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function(str) { return this.valueOf() === str; }
      },

      "$trim": {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function(str) { return this.valueOf().replace(/^\s*((\S+.*\S+)|\S)\s*$/, '$1'); }
      },

      "$removeSpace": {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function(str) { return this.valueOf().replace(/\s/g, ''); }
      },

      "$isRing": {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function() {
          return false;
        }
      }
    });

    /*=====================================*
     * Date.prototype *
     *=====================================*/

    Object.defineProperties(Date.prototype, {
      "$clone": {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function() { return new Date(this.valueOf()); }
      },

      "$equal": {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function(date) { return this.valueOf() === date.valueOf(); }
      },

      "$isRing": {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function() {
          return false;
        }
      }
    });

    /*=====================================*
     * RegExp.prototype *
     *=====================================*/

    Object.defineProperties(RegExp.prototype, {
      "$clone": {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function() {
          var pattern = this.valueOf();
          var flags = '';
          flags += pattern.global ? 'g' : '';
          flags += pattern.ignoreCase ? 'i' : '';
          flags += pattern.multiline ? 'm' : '';
          return new RegExp(pattern.source, flags);
        }
      },

      "$equal": {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function(regexp) {
          var me = this.valueOf();
          return me.source === regexp.source &&
            me.global === regexp.global &&
            me.ignoreCase === regexp.ignoreCase &&
            me.multiline === regexp.multiline;
        }
      },

      "$isRing": {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function() {
          return false;
        }
      }
    });
  };

  var unbind = function () {
    //if release the functions from functionContainer.
    for (var name in bindList) {
      for (var i=0; i < bindList[name].methods.length; i++) {
        var methodName = bindList[name].methods[i];
        if (bindList[name].functionContainer.hasOwnProperty(methodName)) {
          bindList[name].proto[methodName] = bindList[name].functionContainer[methodName];
        } else {
          delete bindList[name].proto[methodName];
        }
      }
      // empty the functionContainer
      bindList[name].functionContainer = {};
    }
  };

  CherryJs.bind = bind;
  CherryJs.unbind = unbind;

})());