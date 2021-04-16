import { CookieJar } from 'tough-cookie';
import { promisify } from 'util';
import got, {Got} from "got";
import CloudflareUtils from "./cloudflareUtils";
import {refactor} from "shift-refactor";

export default class CloudflareSolver {
    protected solverOptions: CloudflareSolverOptions;
    protected baseUrl: string;
    protected httpClient: Got;
    protected cookieJar: CookieJar;

    protected ChlOpts: any;

    constructor(options: CloudflareSolverOptions) {
        options.userAgent = options.userAgent || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.72 Safari/537.36";
        this.solverOptions = options;
        this.baseUrl = CloudflareUtils.extractBaseUrl(options.url as string);

        // Bind cookie jar for usage in got
        this.cookieJar = new CookieJar();
        this.httpClient = got.extend({
            headers: {
                'user-agent': options.userAgent
            },
            cookieJar: this.cookieJar,
            throwHttpErrors: false
        });
    }

    async extractOrchestrateValues() {
        let scriptResponse = await this.httpClient.get(`${this.baseUrl}/cdn-cgi/challenge-platform/h/g/orchestrate/jsch/v1?ray=${this.ChlOpts.cRay}`);
        if (scriptResponse.statusCode !== 200) throw new Error('Unsuccessful orchestrate script status.');

        const $script = refactor(scriptResponse.body);
        // @ts-ignore
        let arrayString = $script('StaticMemberExpression[object.type = "LiteralStringExpression"]').nodes[0].object.value;
        // TODO:
        // Extract initial payload compression function / alphabet.
        // Extract initial payload submission URL.
        // Set the Chl_ctx variables.
    }

    async solve(): Promise<CloudflareSolverResult> {
        if (this.solverOptions.url === undefined) return {error: true, reason: 'Url cannot be undefined'}
        if (this.solverOptions.captcha) return {error: true, reason: 'Unsupported challenge type'};

        let response = await this.httpClient.get(this.solverOptions.url);
        this.ChlOpts = CloudflareUtils.extractChlOps(response.body);

        // GET necessary gifs
        await this.httpClient.get(`${this.baseUrl}/cdn-cgi/images/trace/jschal/js/nocookie/transparent.gif?ray=${this.ChlOpts.cRay}`);
        await this.httpClient.get(`${this.baseUrl}/cdn-cgi/images/trace/jschal/nojs/transparent.gif?ray=${this.ChlOpts.cRay}`);
        await this.extractOrchestrateValues();

        return {
            error: false,
            cfClearance: CloudflareUtils.getCookie(this.cookieJar, this.baseUrl, 'cf_clearance'),
            cfDuid: CloudflareUtils.getCookie(this.cookieJar, this.baseUrl, '__cfduid')
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