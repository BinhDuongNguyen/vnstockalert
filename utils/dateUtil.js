var parseDate = function parseDate(str) {
    if (!/^(\d){8}$/.test(str)) return "invalid date";
    var m1 = parseInt(str.substr(4, 2)) - 1;
    var y = str.substr(0, 4),
        m = m1.toString(),
        d = str.substr(6, 2);
    return new Date(y, m, d);
};

module.exports = {
    parseDate: parseDate
};