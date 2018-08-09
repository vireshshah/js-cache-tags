# js-cache-tags (Simple and fast memory cache with tags support for Javascript/NodeJS projects)

[![Build Status](https://travis-ci.org/vireshshah/js-cache-tags.svg?branch=master)](https://travis-ci.org/vireshshah/js-cache-tags) [![Windows Tests](https://img.shields.io/appveyor/ci/vireshshah/js-cache-tags.svg?label=Windows%20Test)](https://ci.appveyor.com/project/vireshshah/js-cache-tags) [![Dependency Status](https://david-dm.org/vireshshah/js-cache-tags.svg)](https://david-dm.org/vireshshah/js-cache-tags) [![NPM version](https://badge.fury.io/js/js-cache-tags.svg)](http://badge.fury.io/js/js-cache-tags) [![Coveralls Coverage](https://img.shields.io/coveralls/vireshshah/js-cache-tags.svg)](https://coveralls.io/github/vireshshah/js-cache-tags) [![Pull requests](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://www.npmjs.com/package/robert) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/greeeg/robert/blob/master/LICENSE) 

A basic in memory cache module with tags support for Javascript/NodeJS projects. It's an extension of super useful and neat [node cache library](https://github.com/mpneuried/nodecache). It has basic `set`, `get` and `del`, `delByTags` methods and works a little bit like memcached. In addition to this, we can tag item while adding to cache and remove it based on tags as well. Keys can have a timeout (`ttl`) after which they expire and are deleted from the cache. All keys are stored in a single object so the practical limit is at around 1m keys.

Concept inspired by <a href="https://www.drupal.org/">Drupal 8</a>’s <a href="https://www.drupal.org/docs/8/api/cache-api/cache-tags">cache tags</a></p>

# Install

```bash
  npm install js-cache-tags --save
```

Or just require the `js-cache-tags.min.js` file to get the base class.

# Examples

## Initialize:

```js
const JSCacheTags = require( "js-cache-tags" );
const myCache = new JSCacheTags();
```

```js
const JSCacheTags = require( "js-cache-tags" );
const myCache = new JSCacheTags({ stdTTL: 100, checkperiod: 120 });
```

### Options

- `stdTTL`: *(default: `0`)* the standard ttl as number in seconds for every generated cache element.
`0` = unlimited
- `checkperiod`: *(default: `600`)* The period in seconds, as a number, used for the automatic delete check interval.
`0` = no periodic check.
- `errorOnMissing`: *(default: `false`)* en/disable throwing or passing an error to the callback if attempting to `.get` a missing or expired value.
- `useClones`: *(default: `true`)* en/disable cloning of variables. If `true` you'll get a copy of the cached variable. If `false` you'll save and get just the reference.
**Note:** `true` is recommended, because it'll behave like a server-based caching. You should set `false` if you want to save mutable objects or other complex types with mutability involved and wanted.
_Here's a [simple code exmaple](https://runkit.com/mpneuried/useclones-example-83) showing the different behavior_
- `deleteOnExpire`: *(default: `true`)* whether variables will be deleted automatically when they expire.
If `true` the variable will be deleted. If `false` the variable will remain. You are encouraged to handle the variable upon the event `expired` by yourself.

## Store a key with tags (SET):

`myCache.set(key, val, [tags], [ttl], [callback])`

Sets a `key` `value` pair. You can attach `tags` (array). Also possible to define a `ttl` (in seconds).
Returns `true` on success. 

### SET Example 1
```js
obj = { name: "Viresh", age: 35 };
tags = ["tech geek", "foodie"]
myCache.set("myKey", obj, tags, 100, function(err, success){
  if(!err && success) {
    console.log(success);
    // true
    // ... do something ...
  }
});
```

### SET Example 2
```js
obj = { name: "Viresh", age: 30 };
tags = [{"city": "Pune"}, {"country": "India"}]
success = myCache.set( "myKey", obj, tags, 1000 );
```

## Retrieve a key (GET):

`myCache.get(key, [callback], [errorOnMissing])`

Gets a saved value from the cache. Returns a `undefined` if not found or expired.
If the value was found it returns an object with the `key` `value` pair.

```js
try {
    myCache.get("myKey", function( err, value ){
        if (!err) {
            if (value == undefined) {
                // key not found
            } else {
                console.log(value);
                //{ name: "Viresh", age: 35 };
                // ... do something ...
            }
        }
    });
 } catch(err){
    // ENOTFOUND: Key `not-existing-key` not found
 }
```

## Delete by tags (DEL):

`myCache.delByTags(tags, [callback] )`

Delete item from cache by tags. Returns the number of deleted entries.

### DELETE Example 1
```js
myCache.delByTags(["tech geek"], (err, count) => {
    if (!err) {
        console.log(count); // 1
        // ... do something ...
    }
});
```

### DELETE Example 2
```js
myCache.delByTags([{"city": "Pune"}, {"country": "India"}], (err, count) => {
    if (!err) {
        console.log(count); // 1
        // ... do something ...
    }
});
```

### DELETE Example 3
```js
myCache.delByTags([123, 456], (err, count) => {
    if(!err){
        console.log(count); // 1
        // ... do something ...
    }
});
```

## Special Thanks

js-cache-tags is extension to node-cache library (https://github.com/mpneuried/nodecache). Many thanks to Mathias Peter.

##### Copyright © 2018 Viresh Shah, http://www.vireshshah.com
