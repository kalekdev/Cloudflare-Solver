const {CookieJar} = require('tough-cookie');
const CloudflareUtils = require('../src/solve/cloudflareUtils');
const got = require('got');

const URL = 'https://soap2day.to';

let cookieJar = new CookieJar();
let httpClient = got.extend({
    headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36\n'
    },
    cookieJar: cookieJar,
    throwHttpErrors: false,
    retry: 0
});

let cfResponse = await httpClient.get(URL);
let ChlOpts = CloudflareUtils.extractChlOps(cfResponse.body);
await httpClient.get(`${URL}/cdn-cgi/images/trace/jschal/js/nocookie/transparent.gif?ray=${ChlOpts.cRay}`);
await httpClient.get(`${URL}/cdn-cgi/images/trace/jschal/nojs/transparent.gif?ray=${ChlOpts.cRay}`);

let orchestrateResponse = await httpClient.get(`${URL}/cdn-cgi/challenge-platform/h/g/orchestrate/jsch/v1?ray=${ChlOpts.cRay}`);
if (orchestrateResponse.statusCode !== 200) throw new Error('Unsuccessful orchestrate script status.');

// TODO