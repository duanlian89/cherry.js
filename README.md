cherry.js
=========

[cherry.js](http://cherry.jerryzou.com) is a JavaScript utility library, and it can run on both browser and Node. You can use javascript more easily with cherry.js. The sample follows:

Just include this script for using:

    <script src="cherry.min.js"></script>

And enjoy cherry.js:

    var arr = ['a','b','c','d'];
    arr.$swap(0,2);
    console.log(arr); //return ['c','b','a','d'];
    
    var obj_1 = { a:{b:1}, c:[1,2,3] };
    var obj_2 = { a:{b:1}, c:[1,2,3] };
    console.log( obj_1===obj_2 );     //return false;
    console.log( obj_1.$equal(obj_2) );  //return true;

### Use cherry.js in Node.js

#### Install

    npm install --save-dev cherry.js

#### Use

    require('cherry.js');

    var arr = ['a','b','c','d'];
    arr.$swap(0,2);
    console.log(arr); //return ['c','b','a','d'];

## Warning and Error types
- See [the document of errors & warnings](https://github.com/cherryjs/cherry.js/blob/master/error.md)

## More Infos
Home Website: http://cherry.jerryzou.com
