## Overview

A simple message queue similar to SQS. Uses CouchDB for the data persistence layer.
Depends on requestjs.

## Example usage

var SofaQueue = require(__dirname+"/SofaQueue.js");
var Q = new SofaQueue({
    url: http://your-couchdb/dbUrl,
    user: "admin",
    password: "password"
};

Q.insert({message: {AnyObject: {YourHeart: "Desires!"}}}, function(INFO) {
    console.log(INFO);
});

Q.pop({limit: numberOfMessagesToPop}, function(resultsArray) {
    resultsArray.forEach(function(msg) {
        console.log(msg);
    });
});

## Why

I like message queues. CouchDb seems neat and easy for quick rollouts.

## Tests

Haven't made any yet :(