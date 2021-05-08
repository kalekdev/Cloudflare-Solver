function compress(uncompressed, bitsPerChar, getCharFromInt) {
    var H, I;
    H = {};
    H["jiwjs"] = function(X, Y) {
        return X >>> Y;
    };
    H["UbDBd"] = function(X, Y) {
        return X % Y;
    };
    I = H;
    if (v["jyfRJ"] === v["fUcOo"]) var X = function X() {
        context_numBits["timeout"] = 2500;
        getCharFromInt["ontimeout"] = function() {
            j();
        };
    };
    else {
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
            context_data = [],
            context_data_val = 0,
            context_data_position = 0,
            ii;
        for (ii = 0; ii < uncompressed.length; ii += 1)
            if (v["RtGAI"] === "yPmnL") {
                context_c = uncompressed.charAt(ii);
                if (!Object.prototype.hasOwnProperty.call(context_dictionary, context_c)) {
                    context_dictionary[context_c] = context_dictSize++;
                    context_dictionaryToCreate[context_c] = !0;
                }
                context_wc = context_w + context_c;
                if (Object.prototype.hasOwnProperty.call(context_dictionary, context_wc))
                    context_w = context_wc;
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
            } else var Y = function Y() {
                context_dictionaryToCreate = 1;
                for (context_w = 0; context_enlargeIn < context_dictSize; context_numBits++) {
                    context_data = context_data_val << 1 | context_data_position;
                    if (ii == context_c - 1) {
                        context_wc = 0;
                        value.push(X(Y));
                        Z = 0;
                    } else {
                        a0++;
                    }
                    a1 = 0;
                }
                a2 = a3.charCodeAt(0);
                for (a4 = 0; a5 < 16; a6++) {
                    a7 = a8 << 1 | a9 & 1;
                    if (aa == ab - 1) {
                        ac = 0;
                        ad.push(ae(af));
                        ag = 0;
                    } else {
                        ah++;
                    }
                    ai >>= 1;
                }
            };
        if ("" !== context_w) {
            if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
                if (context_w.charCodeAt(0) < 256) {
                    if (v["DKoLv"] === v["bMBTl"]) var Z = function Z() {
                        var a0;
                        a0 = j.charCodeAt(context_data);
                        context_w[2 * ii] = a0 >>> 8;
                        context_dictionary[2 * o + 1] = a0 % 256;
                    };
                    else {
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
        for (;;) {
            context_data_val <<= 1;
            if (context_data_position == bitsPerChar - 1) {
                context_data.push(getCharFromInt(context_data_val));
                break;
            } else context_data_position++;
        }
        return context_data.join("");
    }
}

function decompress(length, resetValue, getNextValue) {
    if ("MOrgs" !== v["AzbDn"]) {
        var dictionary = [],
            next,
            enlargeIn = 4,
            dictSize = 4,
            numBits = 3,
            entry = "",
            result = [],
            i,
            w,
            bits, resb, maxpower, power,
            c,
            data = {
                val: getNextValue(0),
                position: resetValue,
                index: 1
            };
        for (i = 0; i < 3; i += 1) {
            dictionary[i] = i;
        }
        bits = 0;
        maxpower = Math.pow(2, 2);
        for (power = 1; power != maxpower;) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
                data.position = resetValue;
                data.val = getNextValue(data.index++);
            }
            bits |= (resb > 0 ? 1 : 0) * power;
            power <<= 1;
        }
        switch (bits) {
            case 0:
                bits = 0;
                maxpower = Math.pow(2, 8);
                for (power = 1; power != maxpower;) {
                    resb = data.val & data.position;
                    data.position >>= 1;
                    if (data.position == 0) {
                        data.position = resetValue;
                        data.val = getNextValue(data.index++);
                    }
                    bits |= (0 < resb ? 1 : 0) * power;
                    power <<= 1;
                }
                c = A(bits);
                break;
            case 1:
                bits = 0;
                maxpower = Math.pow(2, 16);
                for (power = 1; power != maxpower;) {
                    resb = data.val & data.position;
                    data.position >>= 1;
                    if (data.position == 0) {
                        data.position = resetValue;
                        data.val = getNextValue(data.index++);
                    }
                    bits |= (0 < resb ? 1 : 0) * power;
                    power <<= 1;
                }
                c = A(bits);
                break;
            case 2:
                return "";
        }
        i = dictionary[3] = c;
        for (result.push(c);;)
            if (v["dNlST"] === v["QBvNT"]) var V = function V() {
                var W, X;
                W = {};
                W["DdwYb"] = function(Y, Z, a0) {
                    return Y(Z, a0);
                };
                X = W;
                return j == null ? "" : data.val == "" ? null : numBits["b"](bits.length, 32, function(Y) {
                    return X["DdwYb"](maxpower, "lHwjNX9dOUKqmZkFVxthb0MTpi7vaJnLBArC64SuIYEe3yoD581QczGRfPWg2s", C.charAt(Y));
                });
            };
            else {
                if (data.index > length) return "";
                bits = 0;
                maxpower = Math.pow(2, numBits);
                for (power = 1; power != maxpower;) {
                    resb = data.val & data.position;
                    data.position >>= 1;
                    if (data.position == 0) {
                        data.position = resetValue;
                        data.val = getNextValue(data.index++);
                    }
                    bits |= (0 < resb ? 1 : 0) * power;
                    power <<= 1;
                }
                switch (c = bits) {
                    case 0:
                        bits = 0;
                        maxpower = Math.pow(2, 8);
                        for (power = 1; power != maxpower;) {
                            resb = data.val & data.position;
                            data.position >>= 1;
                            if (data.position == 0) {
                                data.position = resetValue;
                                data.val = getNextValue(data.index++);
                            }
                            bits |= (0 < resb ? 1 : 0) * power;
                            power <<= 1;
                        }
                        dictionary[dictSize++] = A(bits);
                        c = dictSize - 1;
                        enlargeIn--;
                        break;
                    case 1:
                        bits = 0;
                        maxpower = Math.pow(2, 16);
                        for (power = 1; power != maxpower;) {
                            resb = data.val & data.position;
                            data.position >>= 1;
                            if (data.position == 0) {
                                data.position = resetValue;
                                data.val = getNextValue(data.index++);
                            }
                            bits |= (0 < resb ? 1 : 0) * power;
                            power <<= 1;
                        }
                        dictionary[dictSize++] = A(bits);
                        c = dictSize - 1;
                        enlargeIn--;
                        break;
                    case 2:
                        return result.join("");
                }
                if (enlargeIn == 0) {
                    enlargeIn = Math.pow(2, numBits);
                    numBits++;
                }
                if (dictionary[c]) c = dictionary[c];
                else {
                    if (c === dictSize) c = i + i.charAt(0);
                    else return null;
                }
                result.push(c);
                dictionary[dictSize++] = i + c.charAt(0);
                enlargeIn--;
                i = c;
                if (enlargeIn == 0) {
                    enlargeIn = Math.pow(2, numBits);
                    numBits++;
                }
            }
    } else var W = function W() {
        return !!data.index["addEventListener"];
    };
}