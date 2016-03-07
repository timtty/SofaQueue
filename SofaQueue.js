/**
 * Created by tim on 3/2/16.
 */

var req = require("request");
var EventEmitter = require("events").EventEmitter;
var util = require ("util");

function SofaQueue(opts) {
    var self = this;

    self.url = opts.url || "";
    self.user = opts.username || "";
    self.pass = opts.password || "";
    self.debug = opts.debug || false;

    self.ops = {
        couchInsertHTTP: function(opts, callBack) {
            req.post({
                url: opts.url,
                auth: {user: opts.user, pass: opts.pass, sendImmediately: false},
                body: {Message: opts.message},
                json: true
            }, function(err, res, dat) {
                if (!err && dat) {
                    if (dat.error) {
                        if (dat.reason == "You are not a server admin." ||
                            dat.reason == "Name or password is incorrect.") {
                            callBack({Error: "Authentication rejected"});
                        } else {
                            callBack({Error: dat.reason});
                        }
                    } else if (dat.ok) {
                        callBack({OK: {MessageId: dat.id}});
                    } else {
                        callBack({Dunno: dat});
                    }
                } else {
                    callBack({Error: err});
                }
            });
        },
        couchGetHTTP: function(opts, callBack) {
            req.get({
                url: opts.url+"/_all_docs?include_docs=true&limit="+opts.limit,
                auth: {user: opts.user, pass: opts.pass, sendImmediately: false},
                json: true
            }, function(err, res, dat) {
                if (!err && dat) {
                    if (dat.rows) {
                        for (var i = 0; i < dat.rows.length; i++) {
                            var curr = i;
                            self.ops.couchDelHTTP({
                                url: opts.url,
                                user: opts.user,
                                pass: opts.pass,
                                id: dat.rows[i].id,
                                rev: dat.rows[i].value.rev
                            }, function(DELETE) {
                                if (self.debug) {
                                    console.log({DEBUG: {Delete: DELETE}});
                                }

                                if (curr == dat.rows.length) {

                                }
                            });
                        }

                        callBack(dat.rows);
                    } else if (dat.error) {
                        callBack({Error: [dat.error, dat.reason]});
                    } else {
                        callBack({Error: {Unknown: dat}});
                    }
                } else {
                    callBack({Error: err});
                }
            });
        },
        couchDelHTTP: function(opts, callBack) {
            req.del({
                url: opts.url+"/"+opts.id+"?rev="+opts.rev,
                auth: {
                    user: opts.user,
                    pass: opts.pass,
                    sendImmediately: true
                },
                json: true
            }, function(err, res, dat) {
                if (self.debug) {
                    if (!err && dat) {
                        console.log(dat);
                    } else {
                        console.log(dat);
                    }

                }
                callBack();
            });
        }
    };
}

util.inherits(SofaQueue, EventEmitter);

SofaQueue.prototype.insert = function(opts, callBack) {
    var self = this;

    var url = opts.url || self.url;
    var user = opts.username || self.user;
    var pass = opts.password || self.pass;
    var message = opts.message || undefined;

    if (message != undefined) {
        if (url != "") {
            self.ops.couchInsertHTTP({
                url: url,
                user: user,
                pass: pass,
                message: message
            }, function(response) {
                callBack(response);
            });
        } else {
            callBack({Error: {Rejected: "URL is not set"}});
        }
    } else {
        callBack({Error: {Rejected: "Message is not set"}});
    }
};

SofaQueue.prototype.pop = function(opts, callBack) {
    var self = this;

    var url = opts.url || self.url;
    var user = opts.username || self.user;
    var pass = opts.password || self.pass;
    var limit = opts.limit || 1;

    self.ops.couchGetHTTP({
        url: url,
        user: user,
        pass: pass,
        limit: limit
    }, function(response) {
        callBack(response);
    });
};

module.exports = SofaQueue;