import {CookieJar} from "tough-cookie";
const crypto = require('crypto');
const lzString = require('lz-string');
import {getSync} from '@andreekeberg/imagedata'

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

    static getCookie(jar: CookieJar, url: string, name: string): string {
        return jar.getCookiesSync(url).find(cookie => cookie.key == name)!.value
    }

    static decodeChallenge(data: string, cRay: string, alphabet: string): string {
        var v, w, x, y, z, A;
        v = {};
        w = v;
        x = 32;
        y = cRay + "_" + 0;
        y = y.replace(/./g, function (B, C) {
            x ^= y.charCodeAt(C);
        });
        data = Buffer.from(data, 'base64').toString('binary');
        z = [];
        for (A = v = -1; !isNaN(v = data.charCodeAt(++A)); z.push(String.fromCharCode(((v & 255) - x - A % 65535 + 65535) % 255))) ;
        data = z.join("").replace(/ /g, "+");

        let B = {};
        z = function z(E, F) {
            if (!B[E]) {
                var G;
                B[E] = {};
                for (G = 0; G < E.length; G++) {
                    B[E][E.charAt(G)] = G;
                }
            }
            return B[E][F];
        };

        data = lzString._decompress(data.length, 32, function (H) {
            return z(alphabet, data.charAt(H));
        });
        return decodeURIComponent(data);
    }

    static compressToEncodedURIComponent(uncompressed, alphabet): string {
        let bitsPerChar = 6;

        function getCharFromInt(F: any): string {
            return alphabet.charAt(F);
        }

        if (uncompressed == null) return "";
        var i, value,
            context_dictionary = {},
            context_dictionaryToCreate = {},
            context_c = "",
            context_wc = "",
            context_w = "",
            context_enlargeIn = 2, // Compensate for the first entry which should not count
            context_dictSize = 3,
            context_numBits = 2,
            context_data: any = [],
            context_data_val = 0,
            context_data_position = 0,
            ii;

        for (ii = 0; ii < uncompressed.length; ii += 1) {
            context_c = uncompressed.charAt(ii);
            if (!Object.prototype.hasOwnProperty.call(context_dictionary, context_c)) {
                context_dictionary[context_c] = context_dictSize++;
                context_dictionaryToCreate[context_c] = !0;
            }
            context_wc = context_w + context_c;
            if (Object.prototype.hasOwnProperty.call(context_dictionary, context_wc)) context_w = context_wc;
            else {
                if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
                    if (context_w.charCodeAt(0) < 256) {
                        for (i = 0; i < context_numBits; i++) {
                            context_data_val <<= 1;
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            } else {
                                context_data_position++;
                            }
                        }
                        value = context_w.charCodeAt(0);
                        for (i = 0; i < 8; i++) {
                            context_data_val = context_data_val << 1 | value & 1;
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            } else {
                                context_data_position++;
                            }
                            value >>= 1;
                        }
                    } else {
                        value = 1;
                        for (i = 0; i < context_numBits; i++) {
                            context_data_val = context_data_val << 1 | value;
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            } else {
                                context_data_position++;
                            }
                            value = 0;
                        }
                        value = context_w.charCodeAt(0);
                        for (i = 0; i < 16; i++) {
                            context_data_val = context_data_val << 1 | value & 1;
                            if (context_data_position == bitsPerChar - 1) {
                                context_data_position = 0;
                                context_data.push(getCharFromInt(context_data_val));
                                context_data_val = 0;
                            } else {
                                context_data_position++;
                            }
                            value >>= 1;
                        }
                    }
                    context_enlargeIn--;
                    if (context_enlargeIn == 0) {
                        context_enlargeIn = Math.pow(2, context_numBits);
                        context_numBits++;
                    }
                    delete context_dictionaryToCreate[context_w];
                } else {
                    value = context_dictionary[context_w];
                    for (i = 0; i < context_numBits; i++) {
                        context_data_val = context_data_val << 1 | value & 1;
                        if (context_data_position == bitsPerChar - 1) {
                            context_data_position = 0;
                            context_data.push(getCharFromInt(context_data_val));
                            context_data_val = 0;
                        } else {
                            context_data_position++;
                        }
                        value >>= 1;
                    }
                }
                context_enlargeIn--;
                if (context_enlargeIn == 0) {
                    context_enlargeIn = Math.pow(2, context_numBits);
                    context_numBits++;
                }
                context_dictionary[context_wc] = context_dictSize++;
                context_w = String(context_c);
            }
        }

        if ("" !== context_w) {
            if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
                if (context_w.charCodeAt(0) < 256) {
                    for (i = 0; i < context_numBits; i++) {
                        context_data_val <<= 1;
                        if (context_data_position == bitsPerChar - 1) {
                            context_data_position = 0;
                            context_data.push(getCharFromInt(context_data_val));
                            context_data_val = 0;
                        } else {
                            context_data_position++;
                        }
                    }
                    value = context_w.charCodeAt(0);
                    for (i = 0; i < 8; i++) {
                        context_data_val = context_data_val << 1 | value & 1;
                        if (context_data_position == bitsPerChar - 1) {
                            context_data_position = 0;
                            context_data.push(getCharFromInt(context_data_val));
                            context_data_val = 0;
                        } else {
                            context_data_position++;
                        }
                        value >>= 1;
                    }
                } else {
                    value = 1;
                    for (i = 0; i < context_numBits; i++) {
                        context_data_val = context_data_val << 1 | value;
                        if (context_data_position == bitsPerChar - 1) {
                            context_data_position = 0;
                            context_data.push(getCharFromInt(context_data_val));
                            context_data_val = 0;
                        } else {
                            context_data_position++;
                        }
                        value = 0;
                    }
                    value = context_w.charCodeAt(0);
                    for (i = 0; i < 16; i++) {
                        context_data_val = context_data_val << 1 | value & 1;
                        if (context_data_position == bitsPerChar - 1) {
                            context_data_position = 0;
                            context_data.push(getCharFromInt(context_data_val));
                            context_data_val = 0;
                        } else {
                            context_data_position++;
                        }
                        value >>= 1;
                    }
                }
                context_enlargeIn--;
                if (context_enlargeIn == 0) {
                    context_enlargeIn = Math.pow(2, context_numBits);
                    context_numBits++;
                }
                delete context_dictionaryToCreate[context_w];
            } else {
                value = context_dictionary[context_w];
                for (i = 0; i < context_numBits; i++) {
                    context_data_val = context_data_val << 1 | value & 1;
                    if (context_data_position == bitsPerChar - 1) {
                        context_data_position = 0;
                        context_data.push(getCharFromInt(context_data_val));
                        context_data_val = 0;
                    } else {
                        context_data_position++;
                    }
                    value >>= 1;
                }
            }
            context_enlargeIn--;
            if (context_enlargeIn == 0) {
                context_numBits++;
            }
        }
        value = 2;
        for (i = 0; i < context_numBits; i++) {
            context_data_val = context_data_val << 1 | value & 1;
            if (context_data_position == bitsPerChar - 1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
            } else {
                context_data_position++;
            }
            value >>= 1;
        }
        while (true) {
            context_data_val <<= 1;
            if (context_data_position == bitsPerChar - 1) {
                context_data.push(getCharFromInt(context_data_val));
                break;
            } else context_data_position++;
        }
        return context_data.join("");
    }

    static patchDom(dom: any, chlCtx: any, chlOpt: any, performanceEntries: {}[]) {
        Object.defineProperty(dom.window.navigator, 'platform', {
            value: 'Win32'
        });

        dom.window._cf_chl_ctx = chlCtx;
        dom.window._cf_chl_opt = chlOpt;
        dom.window.history.scrollRestoration = 'auto';

        dom.window._cf_atob = function (data) {
            return Buffer.from(data, 'base64').toString('binary');
        }

        dom.window.SHA256 = function (value) {
            return crypto.createHash('sha256').update(value).digest('hex');
        }

        // Checking if height property has changed in Image challenge
        Object.defineProperty(dom.window.Image.prototype, 'computedHeight', {
            value: 0
        });

        Object.defineProperty(dom.window.Image.prototype, 'width', {
            get: () => { // @ts-ignore
                if (this.storedWidth) return this.storedWidth;
                // @ts-ignore
                return this.computedWidth
            },
            set: (value) => {
                // @ts-ignore
                this.storedHeight = value;
            }
        });

        Object.defineProperty(dom.window.Image.prototype, 'height', {
            get: () => { // @ts-ignore
                if (this.storedHeight) return this.storedHeight;
                // @ts-ignore
                return this.computedHeight
            },
            set: (value) => {
                // @ts-ignore
                this.storedHeight = value;
            }
        });

        Object.defineProperty(dom.window.Image.prototype, 'computedWidth', {
            value: 0
        });
        Object.defineProperty(dom.window.Image.prototype, 'naturalHeight', {
            value: 0,
            writable: true
        });
        Object.defineProperty(dom.window.Image.prototype, 'naturalWidth', {
            value: 0,
            writable: true
        });
        Object.defineProperty(dom.window.HTMLSpanElement.prototype, 'offsetHeight', {
            value: 0,
            writable: true
        });
        Object.defineProperty(dom.window.HTMLSpanElement.prototype, 'offsetWidth', {
            value: 0,
            writable: true
        });

        Object.defineProperty(dom.window.HTMLInputElement.prototype, 'maxLength', {
            value: -1,
            writable: true
        });
        Object.defineProperty(dom.window.HTMLTextAreaElement.prototype, 'maxLength', {
            value: -1,
            writable: true
        });

        Object.defineProperty(dom.window.navigator, 'plugins', {
            value: [],
            writable: true
        });

        dom.window.performance.getEntries = function() {
            return performanceEntries
        }

        dom.window.performance.mark = function(name) {
            let entry = {
                duration: 0,
                entryType: 'mark',
                name: name,
                startTime: Date.now()
            }

            performanceEntries.push(entry);
            return entry
        }

        dom.window.Err0r = function (name) {

            let stackMessage = `anonymous/_[_[0]]/<@https://soap2day.to/cdn-cgi/challenge-platform/h/b/orchestrate/jsch/v1?ray=${dom.window._cf_chl_opt.cRay} line 1 > Function:5:7308\n`;
            let errorObj = {
                name: name
            };

            /*let stackArray = stackMessage.split('\n');
            let firstElement = stackArray.shift();
            stackArray = stackArray.slice(1);
            // @ts-ignore
            stackArray.unshift(firstElement);
            stackMessage = stackArray.join('\n');*/

            Object.defineProperty(errorObj, 'stack', {
                value: stackMessage
            });

            return errorObj
        };

        function calculateNewHeight(element) {
            let currentWidth = element.style.width.replace('px', '');
            let totalWidth = element.childNodes[0].style.width.replace('px', '') + element.childNodes[2].style.width.replace('px', '');

            if (currentWidth < totalWidth) {
                element.offsetHeight = element.childNodes[0].height + element.childNodes[2].height;
            } else {
                element.offsetHeight = Math.max(element.childNodes[0].height, element.childNodes[2].height);
            }
        }

        dom.window.document.createElementOriginal = dom.window.document.createElement;
        dom.window.document.createElement = function (type) {
            let element = dom.window.document.createElementOriginal(type);

            if (type == 'span') {
                let widthBuffer = '0px';
                Object.defineProperty(element.style, 'width', {
                    get(): any {
                        return widthBuffer
                    },
                    set(v: any) {
                        widthBuffer = v;
                        if (element.challengeFlag) calculateNewHeight(element);
                    }
                })
            }

            return element;
        }

        let chForm = dom.window.document.getElementById('challenge-form');
        chForm.appendChildOriginal = chForm.appendChild;
        chForm.appendChild = function (element) {
            let successful = false;
            let shouldObserve = false;

            switch (element.tagName.toUpperCase()) {
                case "MARQUEE":
                    if (element.direction == "down" && element.behavior == "alternate" && element.innerHTML == "&nbsp;") {
                        let firstDelay;
                        let secondDelay;
                        if (element.height == 10 && element.width == 10) {
                            successful = true;
                            firstDelay = 100;
                            secondDelay = 184;
                        } else if (element.height == 20 && element.width == 20) {
                            successful = true;
                            firstDelay = 0;
                            secondDelay = 92;
                        }
                        // Else: execute challenge in browser and save values

                        if (successful) {
                            console.log("Solved marquee challenge");

                            // Randomly chosen
                            let currentTime = 15;
                            setTimeout(element.onstart, currentTime);

                            currentTime += firstDelay;
                            setTimeout(element.onbounce, currentTime);
                            for (let i = 1; i < element.loop - 1; i++) {
                                currentTime += secondDelay;
                                setTimeout(element.onbounce, currentTime);
                            }

                            currentTime += secondDelay;
                            setTimeout(element.onfinish, currentTime);
                        }
                    }
                    break;
                case 'IMG':
                    successful = calculateImageSize(element);

                    break;
                case 'SPAN':
                    if (element.innerHTML.includes('\u{AD}') && element.childNodes.length == 3 && element.childNodes[0].nodeName.toUpperCase() == 'IMG' && element.childNodes[2].nodeName.toUpperCase() == 'IMG') {
                        successful = calculateImageSize(element.childNodes[0]);
                        successful = successful && calculateImageSize(element.childNodes[2]);

                        if (successful) {
                            element.challengeFlag = true;
                            calculateNewHeight(element);
                        }
                    }
                    break;
            }

            if (!successful) {
                try {
                    // @ts-ignore
                    document.jbjhgjhg();
                } catch (e) {
                    console.log(e)
                }
                console.log("Unknown element:", element.outerHTML);
            } else {
                if (element.tagName != 'SPAN') {
                    element.dispatchEvent(new dom.window.Event('load'));
                }
            }

            chForm.appendChildOriginal(element);
        }
    }

    static getTransferSize(httpVersion, statusMessage, rawHeaders, contentLength): number {
        let transferSize = httpVersion.length + statusMessage.length + 7; // HTTP 1.1 200 OK\n\r

        for (let i = 0; i < rawHeaders.length; i += 2) {
            transferSize += rawHeaders[i].length + 2 + rawHeaders[i + 1].length + 2;
        }

        transferSize += 2 + contentLength;
        return transferSize
    }

}

function calculateImageSize(element: any): boolean {
    let image;
    if (element.src && element.src !== '') {
        if (element.src.includes('data:') && element.src.includes('base64')) {
            image = getSync(Buffer.from(element.src.split('base64,')[1], 'base64'));
        }
    }
    if (image) {
        let height = element.storedHeight || element.style.height.replace('px', '');
        let width = element.storedWidth || element.style.width.replace('px', '');
        element.naturalHeight = image.height;
        element.naturalWidth = image.width;

        // TODO: Check css
        if (height == '' && width == '') {
            element.height = element.naturalHeight;
            element.width = element.naturalWidth;
        } else if (height != '' && width == '') {
            let scaleFactor = height / element.naturalHeight;
            element.width = scaleFactor * element.naturalWidth;
        } else if (width != '' && height == '') {
            let scaleFactor = width / element.naturalWidth;
            element.height = scaleFactor * element.naturalHeight;
        }

        return true;
    }

    return false;
}