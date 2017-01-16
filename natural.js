let natural = require('natural');

exports.JaroWinklerCheck = function JaroWinklerCheck(stringA, stringB) {
    return natural.JaroWinklerDistance(stringA, stringB);
}
