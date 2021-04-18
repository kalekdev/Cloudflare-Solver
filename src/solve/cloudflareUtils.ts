import {CookieJar} from "tough-cookie";
// To allow access to private functions
const lz = require('lz-string');

export default class CloudflareUtils {
    static extractChlOps(page: string): {} {
        let chlOptString = page.match(/window\._cf_chl_opt=({.*?}.*?})/s)![1];
        return new Function('return ' + chlOptString)()
    }

    static extractBaseUrl(url: string): string {
        let pathArray = url.split('/');
        let protocol = pathArray[0];
        let host = pathArray[2];
        return protocol + '//' + host;
    }

    static getCookie(jar: CookieJar, url: string, name:  string): string {
        return jar.getCookiesSync(url).find(cookie => cookie.key == name)!.value
    }

    static lzCompress(data: string, alphabet: string): string {
        return lz._compress(data, 6, function (a: any) {
            return alphabet.charAt(a)
        })
    }

    static decodeChallenge(data: string, cRay: string): string {
        var v, w, x, y, y, u, z, A;
        v = {};
        v["dLYaj"] = function(B, C) {
            return B % C;
        };
        v["utvqb"] = function(B, C) {
            return B - C;
        };
        w = v;
        x = 32;
        y = cRay + "_" + 0;
        y = y["replace"](/./g, function(B, C) {
            x ^= y["charCodeAt"](C);
        });
        u = Buffer.from(data, 'base64').toString('binary');
        z = [];
        for (A = v = -1; !isNaN(v = u["charCodeAt"](++A)); z["push"](String["fromCharCode"](w["dLYaj"](w["utvqb"](v & 255, x) - A + 65535, 255))));
        return z["join"]("");
    }
}