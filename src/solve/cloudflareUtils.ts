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

    static compressToEncodedURIComponent(uncompressed, alphabet): string {
        let bitsPerChar = 6;
        function getCharFromInt(F: any): string {
            return alphabet.charAt(F);
        }

        if (uncompressed == null) return "";
        var i, value,
            context_dictionary= {},
            context_dictionaryToCreate= {},
            context_c="",
            context_wc="",
            context_w="",
            context_enlargeIn= 2, // Compensate for the first entry which should not count
            context_dictSize= 3,
            context_numBits= 2,
            context_data: any=[],
            context_data_val=0,
            context_data_position=0,
            ii;

        for (ii = 0; ii  < uncompressed .length; ii  += 1) {
            context_c = uncompressed.charAt(ii );
            if (!Object.prototype.hasOwnProperty.call(context_dictionary, context_c)) {
                context_dictionary[context_c] = context_dictSize++;
                context_dictionaryToCreate[context_c] = !0;
            }
            context_wc = context_w + context_c;
            if (Object.prototype.hasOwnProperty.call(context_dictionary, context_wc )) context_w = context_wc ;
            else {
                if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
                    if (context_w.charCodeAt(0) < 256) {
                        for (i = 0; i < context_numBits;i++) {
                            context_data_val <<= 1;
                            if (context_data_position  == bitsPerChar - 1) {
                                context_data_position  = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val  = 0;
                            } else {
                                context_data_position ++;
                            }
                        }
                        value = context_w.charCodeAt(0);
                        for (i = 0; i < 8;i++) {
                            context_data_val  = context_data_val  << 1 | value  & 1;
                            if (context_data_position  == bitsPerChar - 1) {
                                context_data_position  = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val  = 0;
                            } else {
                                context_data_position++;
                            }
                            value  >>= 1;
                        }
                    } else {
                        value  = 1;
                        for (i = 0; i < context_numBits;i++) {
                            context_data_val  = context_data_val  << 1 | value ;
                            if (context_data_position  == bitsPerChar - 1) {
                                context_data_position  = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val  = 0;
                            } else {
                                context_data_position ++;
                            }
                            value = 0;
                        }
                        value  = context_w.charCodeAt(0);
                        for (i = 0; i < 16; i++) {
                            context_data_val  = context_data_val  << 1 | value  & 1;
                            if (context_data_position  == bitsPerChar - 1) {
                                context_data_position  = 0;
                                context_data.push(getCharFromInt(context_data_val ));
                                context_data_val  = 0;
                            } else {
                                context_data_position ++;
                            }
                            value  >>= 1;
                        }
                    }
                    context_enlargeIn--;
                    if (context_enlargeIn == 0) {
                        context_enlargeIn = Math.pow(2, context_numBits);
                        context_numBits ++;
                    }
                    delete context_dictionaryToCreate[context_w];
                } else {
                    value  = context_dictionary[context_w];
                    for (i = 0; i < context_numBits ; i++) {
                        context_data_val  = context_data_val  << 1 | value  & 1;
                        if (context_data_position  == bitsPerChar - 1) {
                            context_data_position  = 0;
                            context_data.push(getCharFromInt(context_data_val ));
                            context_data_val  = 0;
                        } else {
                            context_data_position ++;
                        }
                        value  >>= 1;
                    }
                }
                context_enlargeIn--;
                if (context_enlargeIn == 0) {
                    context_enlargeIn = Math.pow(2, context_numBits );
                    context_numBits ++;
                }
                context_dictionary[context_wc ] = context_dictSize++;
                context_w = String(context_c);
            }
        }

        if ("" !== context_w) {
            if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
                if (context_w.charCodeAt(0) < 256) {
                    for (i = 0; i < context_numBits; i++) {
                        context_data_val  <<= 1;
                        if (context_data_position  == bitsPerChar - 1) {
                            context_data_position  = 0;
                            context_data.push(getCharFromInt(context_data_val ));
                            context_data_val  = 0;
                        } else {
                            context_data_position ++;
                        }
                    }
                    value  = context_w.charCodeAt(0);
                    for (i = 0; i < 8; i++) {
                        context_data_val  = context_data_val  << 1 | value  & 1;
                        if (context_data_position  == bitsPerChar - 1) {
                            context_data_position  = 0;
                            context_data.push(getCharFromInt(context_data_val ));
                            context_data_val  = 0;
                        } else {
                            context_data_position ++;
                        }
                        value  >>= 1;
                    }
                } else {
                    value  = 1;
                    for (i = 0; i < context_numBits;i++) {
                        context_data_val  = context_data_val  << 1 | value ;
                        if (context_data_position  == bitsPerChar - 1) {
                            context_data_position  = 0;
                            context_data.push(getCharFromInt(context_data_val ));
                            context_data_val  = 0;
                        } else {
                            context_data_position ++;
                        }
                        value = 0;
                    }
                    value  = context_w.charCodeAt(0);
                    for (i = 0; i < 16; i++) {
                        context_data_val  = context_data_val  << 1 | value  & 1;
                        if (context_data_position  == bitsPerChar - 1) {
                            context_data_position  = 0;
                            context_data.push(getCharFromInt(context_data_val ));
                            context_data_val  = 0;
                        } else {
                            context_data_position ++;
                        }
                        value  >>= 1;
                    }
                }
                context_enlargeIn--;
                if (context_enlargeIn == 0) {
                    context_enlargeIn = Math.pow(2, context_numBits );
                    context_numBits++;
                }
                delete context_dictionaryToCreate[context_w];
            } else {
                value  = context_dictionary[context_w];
                for (i = 0; i < context_numBits ; i++) {
                    context_data_val  = context_data_val  << 1 | value  & 1;
                    if (context_data_position  == bitsPerChar - 1) {
                        context_data_position  = 0;
                        context_data.push(getCharFromInt(context_data_val ));
                        context_data_val  = 0;
                    } else {
                        context_data_position ++;
                    }
                    value  >>= 1;
                }
            }
            context_enlargeIn--;
            if (context_enlargeIn == 0) {
                context_numBits ++;
            }
        }
        value = 2;
        for (i = 0; i < context_numBits; i++) {
            context_data_val  = context_data_val  << 1 | value  & 1;
            if (context_data_position  == bitsPerChar - 1) {
                context_data_position  = 0;
                context_data.push(getCharFromInt(context_data_val ));
                context_data_val  = 0;
            } else {
                context_data_position ++;
            }
            value  >>= 1;
        }
        while (true) {
            context_data_val  <<= 1;
            if (context_data_position  == bitsPerChar - 1) {
                context_data.push(getCharFromInt(context_data_val ));
                break;
            } else context_data_position ++;
        }
        return context_data.join("");
    }

    static patchDom(dom: any, chlCtx: any, chlOpt: any) {
        dom.window._cf_chl_ctx = chlCtx;
        dom.window._cf_chl_opt = chlOpt;

        dom.window._cf_atob = function (data) {
            return Buffer.from(data, 'base64').toString('binary');
        }
    }
}