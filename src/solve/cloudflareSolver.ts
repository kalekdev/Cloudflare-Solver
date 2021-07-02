import got, {Got} from "got";
import * as tunnel from 'tunnel';
import CloudflareUtils from "./cloudflareUtils";
import {refactor} from "shift-refactor";
const beautify = require('js-beautify');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
import {JSDOM, CookieJar, ResourceLoader} from 'jsdom';
import {Script} from 'vm';

export default class CloudflareSolver {
    protected solverOptions: CloudflareSolverOptions;
    protected baseUrl!: string;
    protected httpClient: Got;
    protected cookieJar: JSDOM.cookieJar;

    protected StartTs: number;
    protected Dom: JSDOM;
    protected ChlOpts: any;
    protected ChlCtx: any;
    protected PerformanceEntries: any[];
    protected LzAlphabet!: string;
    protected GetChallengePath!: string;

    constructor(options: CloudflareSolverOptions) {
        options.userAgent = options.userAgent || "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:88.0) Gecko/20100101 Firefox/88.0";
        this.solverOptions = options;

        // Bind cookie jar for usage in got
        this.cookieJar = new CookieJar();
        this.httpClient = got.extend({
            headers: {
                'user-agent': options.userAgent
            },
            agent: {
                https: tunnel.httpsOverHttp({
                    proxy: {
                        port: 8888,
                    }
                })
            },
            cookieJar: this.cookieJar,
            throwHttpErrors: false,
            retry: 0
        });

        this.StartTs = Date.now();
        this.PerformanceEntries = [];
    }

    async extractOrchestrateValues() {
        let scriptResponse = await this.httpClient.get(`${this.baseUrl}/cdn-cgi/challenge-platform/h/g/orchestrate/jsch/v1?ray=${this.ChlOpts.cRay}`);
        this.PerformanceEntries.push({
            name: `${this.baseUrl}/cdn-cgi/challenge-platform/h/g/orchestrate/jsch/v1?ray=${this.ChlOpts.cRay}`,
            nextHopProtocol: 'http/1.1',
            initiatorType: 'script',
            encodedBodySize: scriptResponse.headers["content-length"],
            transferSize: CloudflareUtils.getTransferSize(scriptResponse.httpVersion, scriptResponse.statusMessage, scriptResponse.rawHeaders, scriptResponse.headers["content-length"])
        });

        if (scriptResponse.statusCode !== 200) throw new Error('Unsuccessful orchestrate script status.');

        const $script = refactor(scriptResponse.body);
        // @ts-ignore
        let stringArray = $script('StaticMemberExpression[object.type = "LiteralStringExpression"]').nodes[0].object.value.split(',');
        this.LzAlphabet = stringArray.find((s: string) => s.length == 65 && s.includes('$'));
        this.GetChallengePath = String(scriptResponse.body.match(/\/[.|0-9]*:\d{10}:.{64}\//));

        this.ChlCtx = {
            cvId: this.ChlOpts.cvId,
            chReq: this.ChlOpts.cType,
            cNounce: this.ChlOpts.cNounce,
            chC: 0, chCAS: 0, oV: 1,
            cRq: this.ChlOpts.cRq
        };
    }

    async solve(): Promise<CloudflareSolverResult> {
        if (this.solverOptions.url === undefined) return {error: true, reason: 'Url cannot be undefined'}
        if (this.solverOptions.captcha) return {error: true, reason: 'Unsupported challenge type'};
        this.baseUrl = CloudflareUtils.extractBaseUrl(this.solverOptions.url as string);

        let response = await this.httpClient.get(this.solverOptions.url);
        this.PerformanceEntries.push({
            name: this.solverOptions.url,
            nextHopProtocol: 'http/1.1',
            initiatorType: 'navigation',
            encodedBodySize: response.headers["content-length"],
            transferSize: CloudflareUtils.getTransferSize(response.httpVersion, response.statusMessage, response.rawHeaders, response.headers["content-length"])
        });

        this.ChlOpts = CloudflareUtils.extractChlOps(response.body);
        this.Dom = new JSDOM(response.body, {
            runScripts: 'dangerously',
            pretendToBeVisual: true,
            url: this.solverOptions.url,
            cookieJar: this.cookieJar,
            resources: new ResourceLoader({
                userAgent: this.solverOptions.userAgent
            })
        });

        await this.extractOrchestrateValues();

        // GET necessary gifs
        let firstGifResponse = await this.httpClient.get(`${this.baseUrl}/cdn-cgi/images/trace/jschal/js/nocookie/transparent.gif?ray=${this.ChlOpts.cRay}`);
        this.PerformanceEntries.push({
            name: `${this.baseUrl}/cdn-cgi/images/trace/jschal/js/nocookie/transparent.gif?ray=${this.ChlOpts.cRay}`,
            nextHopProtocol: 'http/1.1',
            initiatorType: 'img',
            encodedBodySize: firstGifResponse.headers["content-length"],
            transferSize: CloudflareUtils.getTransferSize(firstGifResponse.httpVersion, firstGifResponse.statusMessage, firstGifResponse.rawHeaders, firstGifResponse.headers["content-length"])
        });

        let secondGifResponse = await this.httpClient.get(`${this.baseUrl}/cdn-cgi/images/trace/jschal/nojs/transparent.gif?ray=${this.ChlOpts.cRay}`);
        this.PerformanceEntries.push({
            name: `${this.baseUrl}/cdn-cgi/images/trace/jschal/nojs/transparent.gif?ray=${this.ChlOpts.cRay}`,
            nextHopProtocol: 'http/1.1',
            initiatorType: 'css',
            encodedBodySize: secondGifResponse.headers["content-length"],
            transferSize: CloudflareUtils.getTransferSize(secondGifResponse.httpVersion, secondGifResponse.statusMessage, secondGifResponse.rawHeaders, secondGifResponse.headers["content-length"])
        });

        let faviconResponse = await this.httpClient.get(`${this.baseUrl}/favicon.ico`);
        this.PerformanceEntries.push({
            name: `${this.baseUrl}/favicon.ico`,
            nextHopProtocol: 'http/1.1',
            initiatorType: 'other',
            encodedBodySize: faviconResponse.headers["content-length"],
            transferSize: CloudflareUtils.getTransferSize(faviconResponse.httpVersion, faviconResponse.statusMessage, faviconResponse.rawHeaders, faviconResponse.headers["content-length"])
        });

        this.cookieJar.setCookieSync('cf_chl_prog=e', this.baseUrl);
        let getChallengeUrl = `${this.baseUrl}/cdn-cgi/challenge-platform/h/g/flow/ov1${this.GetChallengePath}${this.ChlOpts.cRay}/${this.ChlOpts.cHash}`;

        let compressedCtx = CloudflareUtils.compressToEncodedURIComponent(JSON.stringify(this.ChlCtx), this.LzAlphabet).replace('+', '%2b');
        let payload = 'v_' + this.ChlOpts.cRay + '=' + compressedCtx;

        let getChallengeResponse = await this.httpClient.post(getChallengeUrl, {
            headers: {
                'Content-type': 'application/x-www-form-urlencoded',
                'CF-Challenge': this.ChlOpts.cHash
            },
            body: payload
        });

        this.PerformanceEntries.push({
            name: getChallengeUrl,
            nextHopProtocol: 'http/1.1',
            initiatorType: 'xmlhttprequest',
            encodedBodySize: getChallengeResponse.headers["content-length"],
            transferSize: CloudflareUtils.getTransferSize(getChallengeResponse.httpVersion, getChallengeResponse.statusMessage, getChallengeResponse.rawHeaders, getChallengeResponse.headers["content-length"])
        });

        if (getChallengeResponse.statusCode != 200) throw new Error('Error GETing first challenge.');
        fs.writeFileSync('scripts/obfuscated/finalChallengeEx', CloudflareUtils.decodeChallenge(getChallengeResponse.body, this.ChlOpts.cRay, this.LzAlphabet));
        let { stdout, stderr } = await exec('node deobfuscateChallenge.js ' + this.ChlOpts.cRay, {cwd: 'D:/Dev/Cloudsolve/Cloudflare/scripts/deobfuscators'});
        console.log(stdout);
        let firstChallengeScript = new Script(beautify('debugger;' + fs.readFileSync('scripts/deobfuscated/finalChallengeEx.js', 'utf-8')));
        CloudflareUtils.patchDom(this.Dom, this.ChlCtx, this.ChlOpts, this.PerformanceEntries);

        const vmContext = this.Dom.getInternalVMContext();
        firstChallengeScript.runInContext(vmContext);

        compressedCtx = CloudflareUtils.compressToEncodedURIComponent(JSON.stringify(this.ChlCtx), this.LzAlphabet).replace('+', '%2b');
        payload = 'v_' + this.ChlOpts.cRay + '=' + compressedCtx;

        let sendChallengeSolutionResponse = await this.httpClient.post(getChallengeUrl, {
            headers: {
                'Content-type': 'application/x-www-form-urlencoded',
                'CF-Challenge': this.ChlOpts.cHash
            },
            body: payload
        });

        if (getChallengeResponse.statusCode != 200) throw new Error('Error POSTing challenge solution.');


        return {
            error: false,
            cfClearance: compressedCtx
            //cfClearance: CloudflareUtils.getCookie(this.cookieJar, this.baseUrl, 'cf_clearance'),
            //cfDuid: CloudflareUtils.getCookie(this.cookieJar, this.baseUrl, '__cfduid')
        }
    }
}

export interface CloudflareSolverOptions {
    url: string | undefined;
    userAgent?: string;
    captcha: boolean;
}

export interface CloudflareSolverResult {
    error: boolean;
    reason?: string;
    cfClearance?: string | undefined;
    cfDuid?: string | undefined;
}