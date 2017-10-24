'use strict';

module.exports = function (obj, opts) {
    if (!opts) opts = {};
    if (typeof opts === 'function') opts = { cmp: opts };
    var cycles = (typeof opts.cycles === 'boolean') ? opts.cycles : false;

    var cmp = opts.cmp && (function (f) {
        return function (node) {
            return function (a, b) {
                var aobj = { key: a, value: node[a] };
                var bobj = { key: b, value: node[b] };
                return f(aobj, bobj);
            };
        };
    })(opts.cmp);

    var seen = [];
    return (function stringify (node) {
        if (node && node.toJSON && typeof node.toJSON === 'function') {
            node = node.toJSON();
        }

        if (node === undefined) {
            return;
        }
        if (typeof node !== 'object' || node === null) {
            return JSON.stringify(node);
        }
        var i, out;
        if (Array.isArray(node)) {
            out = [];
            for (i = 0; i < node.length; i++) {
                var item = stringify(node[i]) || JSON.stringify(null);
                out.push(item);
            }
            return '[' + out.join(',') + ']';
        }

        if (seen.indexOf(node) !== -1) {
            if (cycles) return JSON.stringify('__cycle__');
            throw new TypeError('Converting circular structure to JSON');
        }
        else seen.push(node);

        var keys = Object.keys(node).sort(cmp && cmp(node));
        out = [];
        for (i = 0; i < keys.length; i++) {
            var key = keys[i];
            var value = stringify(node[key]);

            if(!value) continue;

            var keyValue = JSON.stringify(key) + ':' + value;
            out.push(keyValue);
        }
        seen.splice(seen.indexOf(node), 1);
        return '{' + out.join(',') + '}';
    })(obj, 0);
};
