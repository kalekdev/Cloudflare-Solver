const lzString = require('lz-string');

let alphabet = 'AednJjLz6Sa$7vqkZo9tBm0M42UViFDXRETcK-xWPyQrYhuwOg5Hl1+NCbsfp8GI3';
let compressed = 'vC6RgRjR9RyRcTAMdAFRDgZ0RS4PdCOeqAExzhRLCORAlCAixRaCycM6AiAVA7OdiAo-rRaA9ZAx9JAd2EKA7S6AnzZBeeA7rasUALy6eQQAK9EdtaiZA9BS0dYe2$ReKAWWOeDA6%2bKAgAqCqA$2ZJnAUAagaMQCiA$HdSj6AaRnQXjHJQZADA7CAxEPiAYCAmxPAbRn9wu6An-CEjq6pnEMSAn4ATEBq50y7nRATuo0slE178amFAq5TmEM98d7m4dcbMAn5Zg0npRn0jmn9uQMJlEOBnuM2O+yNZOdTglJFrReUQo8BpEOA$jhbk8I6KR-SV$PAard9t6nOd9n2kAAaZiLWJtjpGMJCWGAzjIWEKPYzAhIKjoaKQ-CPAAHDZpAAUAzP4AC1jdIW9Dq6kzeYS1sdcpw8YhTBUCDjg9ReQajpamF$Od6VT2gPkEFAedeHQpWJP-JG$RzMPeHACRTuWJBn9JmJkdaJddz-J+L5GvilT2y9E7dEB$O9-puZqXJ6UATt19tqOB$QYQL6k5mT4jB67oCAAB6EBPFmdkcskpkQakcAqJjXJ5uACD$CrvEhZS0hRlaBlkLB0AveoTJjgzYr$Tej1K-gYRSoaB0MRnEZ-zgBQC4LPaJJrJ7xF6aymK-YBBhK-ApzA0Ump0sPZix9RhEBrv6lLPEWEI-nTelBjBp7ZxBPGZoq6gAUJplEpep1ZoACIcSJ5FSFk6Ddy7CMolKBinSd5TrSk6mt6h6HEkeOQtGvxuRO$PZoaqEMeFJpXggR6Xn4q6ZgPAiMRFeBwEFjdIc2$705HjOYOpv6+oQaBJZOJpYg1a0GZPk6uok$KF$Gq6rEZjlCRhYCtnG6ZUEkkT$SVA6zT-z9CZZ$7YPikZYQ17C+QuaKgODJOzZPyCvEedTARiz9jdaVa+emj4t6DjBzcSLA5tHT5pTTvQYrCYCAEkLAEe7wKnRdziPRCBJieiwKdMqeP+rq$KieuKpFomLRta5YCinIjOUEadTGS1LAS2pdR+21jdPTHq6MZPJOeH5epzRozDJclk6JZIKdAclvKJZKQCLTbzOpEivxz5HjCaeJzBOz5JPYy7hK9cuACqOoeZpE7cj$aJ-dG6iepF$bkZ0HGkp8AqepUd+kKEnjep$6BeJgAPQ6JoRjYaeeJJUdbzREeFdTLTSFQIg0LRZOs0PJoZQEieVLRG95WBLTudtYeVa6utI$0t$5kKzgeqUk0yd5B6DkZzHCcAZoQjl8eQ74MZpeAutVXZmoaa+7n5kxeHTSvvsyjorEQJ5IE0ePadyeAucSjCLRFJ5QZovRznJLRHRPvRtOSzZDe9zlGt2jY5ZzjhzEZh6nc4kprcnkKRonLPwYRqd5ABjOmcU-dUc2wpPW2TR8eFkCmZqjlie-faEeVkjzE1kCZOieOmoeeOwRpzBzoR$PXnIdW+ed7R1TJJpJ1VLP61QjYDdsA6inTkZPEFzRjogAkYc6a6eHqk6uRPPZCRzSYXJdelt5ujdCRULusIdeCJe9k6iAPdpFSp$arc4J5Iz4epan2nZzFXOuZwn2ARvxiC+yicUWPkKqPPRveDdsjLDRMA-Ay546I2Ap4xAonfr7ACWpQcbng-BXJaAaHUTQvQ$OmRWEujpeZaJMZuRodsv6nZOOkEDAPjYeOai6n4SAzBV79RAOXAqJ7DZURrdi5CJpLA8JERPdBvQjA+PreW0P-4XCtOnRYcyvQaqGZac4ApkKe6AeXagZA';

let baseReverseDic = {};
function getBaseValue(alphabet, character) {
    if (!baseReverseDic[alphabet]) {
        baseReverseDic[alphabet] = {};
        for (var i=0 ; i<alphabet.length ; i++) {
            baseReverseDic[alphabet][alphabet.charAt(i)] = i;
        }
    }
    return baseReverseDic[alphabet][character];
}

function decompressFromEncodedURIComponent (input) {
    if (input == null) return "";
    if (input == "") return null;
    input = input.replace(/ /g, "+");
    return lzString._decompress(input.length, 32, function(index) { return getBaseValue(alphabet, input.charAt(index)); });
}


console.log(decompressFromEncodedURIComponent(compressed));