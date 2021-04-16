import {CookieJar} from "tough-cookie";

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
}