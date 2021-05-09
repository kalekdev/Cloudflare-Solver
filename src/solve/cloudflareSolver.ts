import {CookieJar} from 'tough-cookie';
import got, {Got} from "got";
import * as tunnel from 'tunnel';
import CloudflareUtils from "./cloudflareUtils";
import {refactor} from "shift-refactor";
import {JSDOM} from 'jsdom';

export default class CloudflareSolver {
    protected solverOptions: CloudflareSolverOptions;
    protected baseUrl!: string;
    protected httpClient: Got;
    protected cookieJar: CookieJar;

    protected StartTs: number;
    protected Dom: JSDOM;
    protected ChlOpts: any;
    protected ChlCtx: any;
    protected LzAlphabet!: string;
    protected GetChallengePath!: string;

    constructor(options: CloudflareSolverOptions) {
        options.userAgent = options.userAgent || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.72 Safari/537.36";
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
    }

    async extractOrchestrateValues() {
        let scriptResponse = await this.httpClient.get(`${this.baseUrl}/cdn-cgi/challenge-platform/h/g/orchestrate/jsch/v1?ray=${this.ChlOpts.cRay}`);
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
        this.ChlOpts = CloudflareUtils.extractChlOps(response.body);
        this.Dom = new JSDOM(response.body, {
            runScripts: 'dangerously',
            pretendToBeVisual: true,
            url: this.solverOptions.url
        })

        // GET necessary gifs
        await this.httpClient.get(`${this.baseUrl}/cdn-cgi/images/trace/jschal/js/nocookie/transparent.gif?ray=${this.ChlOpts.cRay}`);
        await this.httpClient.get(`${this.baseUrl}/cdn-cgi/images/trace/jschal/nojs/transparent.gif?ray=${this.ChlOpts.cRay}`);
        await this.extractOrchestrateValues();

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

        if (getChallengeResponse.statusCode != 200) throw new Error('Error GETing first challenge.');
        let firstChallengeScript = CloudflareUtils.decodeChallenge(getChallengeResponse.body, this.ChlOpts.cRay);
        console.log(firstChallengeScript);




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