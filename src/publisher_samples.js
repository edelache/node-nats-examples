import test from "ava";
let NATS = require('nats');


test('publish_bytes', (t) => {
    t.plan(1);
    return new Promise((resolve, failed) => {
        // [begin publish_bytes]
        let nc = NATS.connect({url: "nats://demo.nats.io:4222", preserveBuffers: true});
        let buf = Buffer.allocUnsafe(12);
        buf.fill("All is well");
        nc.publish('updates', buf);
        // [end publish_bytes]
        nc.flush(() => {
            t.pass();
            nc.close();
            resolve();
        })
    });
});

test('publish_json', (t) => {
    t.plan(1);
    return new Promise((resolve, failed) => {
        // [begin publish_json]
        let nc = NATS.connect({url: "nats://demo.nats.io:4222", json: true});
        nc.publish('updates', {ticker: 'GOOG', price: 1200});
        // [end publish_json]
        nc.flush(() => {
            t.pass();
            nc.close();
            resolve();
        })
    });
});

test('publish_with_reply', (t) => {
    t.plan(1);
    return new Promise((resolve, failed) => {
        let nc = NATS.connect({url: "nats://demo.nats.io:4222"});
        // [begin publish_with_reply]
        // set up a subscription to process the request
        nc.subscribe('time', (msg, reply) => {
            if(reply) {
                nc.publish(reply, new Date().toLocaleTimeString());
            }
        });

        // create a subscription subject that the responding send replies to
        let inbox = NATS.createInbox();
        nc.subscribe(inbox, {max: 1}, (msg) => {
            t.log('the time is', msg);
            nc.close();
        });

        nc.publish('time', "", inbox);
        // [end publish_with_reply]
        nc.flush(() => {
            t.pass();
            resolve();
        })
    });
});

test('request_reply', (t) => {
    t.plan(1);
    return new Promise((resolve, failed) => {
        let nc = NATS.connect({url: "nats://demo.nats.io:4222"});

        // set up a subscription to process the request
        nc.subscribe('time', (msg, reply) => {
            if(reply) {
                nc.publish(reply, new Date().toLocaleTimeString());
            }
        });

        // [begin request_reply]
        nc.requestOne('time', (msg) => {
            t.log('the time is', msg);
            nc.close();
        });
        // [end request_reply]
        nc.flush(() => {
            t.pass();
            resolve();
        })
    });
});

test('flush', (t) => {
    t.plan(1);
    return new Promise((resolve, failed) => {
        // [begin flush]
        let nc = NATS.connect({url: "nats://demo.nats.io:4222"});
        let start = Date.now();
        nc.flush(() => {
            t.log('round trip completed in', Date.now() - start, 'ms');
        });

        nc.publish('foo');
        // function in flush is optional
        nc.flush();
        // [end flush]
        nc.flush(() => {
            t.pass();
            resolve();
        })
    });
});


test('wildcard_tester', async(t) => {
    return new Promise((resolve, failed) => {
        let nc = NATS.connect({url: "nats://demo.nats.io:4222"});
        nc.subscribe('time.>', (msg, reply, subject) => {
            // converting timezones correctly in node requires a library
            // this doesn't take into account *many* things.
            let time = "";
            switch (subject) {
                case 'time.us.east':
                    time = new Date().toLocaleTimeString("en-us", {timeZone: "America/New_York"});
                    break;
                case 'time.us.central':
                    time = new Date().toLocaleTimeString("en-us", {timeZone: "America/Chicago"});
                    break;
                case 'time.us.mountain':
                    time = new Date().toLocaleTimeString("en-us", {timeZone: "America/Denver"});
                    break;
                case 'time.us.west':
                    time = new Date().toLocaleTimeString("en-us", {timeZone: "America/Los_Angeles"});
                    break;
                default:
                    time = "I don't know what you are talking about Willis";
            }
            t.log(subject, time);
        });

        // [begin wildcard_tester]
        nc.publish('time.us.east');
        nc.publish('time.us.central');
        nc.publish('time.us.mountain');
        nc.publish('time.us.west');
        // [end wildcard_tester]

        nc.flush(() => {
            nc.close();
            t.pass();
            resolve();
        });
    });
});
