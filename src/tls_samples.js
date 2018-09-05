import test from "ava";
let NATS = require('nats');

test('connect_tls_url', (t) => {
    return new Promise((resolve, reject) => {
        // [begin connect_tls_url]
        let nc = NATS.connect({
            url: "tls://demo.nats.io:4443",
            tls: true
        });
        // [end connect_tls_url]
        nc.on('connect', () => {
            nc.close();
            t.pass();
            resolve();
        });
    });
});


test('connect_tls', (t) => {
    // [begin connect_tls]
    // TLS connections should have a 'tls' url in node-nats.
    // [end connect_tls]
    t.pass();
});