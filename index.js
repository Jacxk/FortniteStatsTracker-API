const perf_hooks = require('perf_hooks');
const app = require('express')();
const FortniteClient = require('fortnite');

const performance = perf_hooks.performance;
const Cooldown = require('./Cooldown.js');
const Queue = require('./Queue.js');
const config = require('./config.json');

const cooldown = new Cooldown(config.cooldown);
const queue = new Queue(config.globalCooldown);
const fortnite = new FortniteClient(process.env.API_TOKEN);

app.get('/', (req, res) => {
    const start = performance.now();
    
    res.status(404).send({
        success: false,
        code: 404,
        time: performance.now() - start,
        data: 'Page Not Found'
    });
});

app.get('/v1/u=:username&p=:platform', (req, res) => {

    const start = performance.now();

    let ip;
    if (req.headers['x-forwarded-for']) ip = req.headers['x-forwarded-for'].split(',')[0];
    else ip = req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    if (!ip) return res.status(500).send({
        success: false,
        code: 500,
        time: performance.now() - start,
        data: 'Internal Server Error'
    });

    if (cooldown.active(ip)) return res.status(420).send({
        success: false,
        code: 420,
        time: performance.now() - start,
        data: 'Access denied, requesting too often'
    });

    if ((queue.queue.length + 1) * config.globalCooldown > 30000) return res.status(429).send({
        success: false,
        code: 429,
        time: performance.now() - start,
        data: 'Requests are limited, please try again in a few seconds...'
    });

    const inQueue = queue.add({
        req,
        res,
        ip,
        start
    });

    if (inQueue) res.end();
});

queue.on('cycle', request => {

    fortnite.user(request.req.params.username, request.req.params.platform).then(stats => {

        console.log('Success!');
        cooldown.add(request.ip);

        return request.res.status(200).send({
            success: true,
            code: 200,
            time: performance.now() - request.start,
            data: stats
        });

    }).catch(e => {

        console.log('Failure!');
        cooldown.add(request.ip);

        return request.res.status(500).send({
            success: false,
            code: 500,
            time: performance.now() - request.start,
            data: 'Internal Server Error...'
        });

    });

});

const server = app.listen(process.env.PORT || 9090, () => {
    console.log(`Listening on port number ${server.address().port}`);
});
