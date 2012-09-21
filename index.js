/*global YUI, GLOBAL */
module.exports = (function () {

    var _modules,    // The collected modules object.
        _file,       // The path of current handling file.
        _path,       // Find YUI modules under this path.
        _exec,       // The exec method of child_process module.
        //==========
        // Methods
        //==========
        _sortObject, // The object sorting method.
        collect;     // The collect method.

    _modules = {};
    _exec = require("child_process").exec;

    // Add YUI as global variable to prevent undefined error.
    GLOBAL.YUI = function () {};

    // Get module config by making a new YUI.add method.
    YUI.add = function (name, callback, version, config) {
        var i;
        if (!config) {
            return;
        }
        _modules[name] = {};

        // Append each property to the new object.
        for (i in config) {
            if (config.hasOwnProperty(i)) {
                if (i === "requires") {
                    // Just for beautifying the output.
                    _modules[name].requires = config.requires.sort();
                } else {
                    _modules[name][i] = config[i];
                }
            }
        }

        // Append file path.
        if (!_modules[name].js) {
            _modules[name].js = _file.replace(_path, "");
        }
    };

    /**
     * Sort object items by key.
     *
     * @method _sortObject
     * @private
     * @param o {Object} The input object.
     * @return {Object} The sorted object.
     */
    _sortObject = function (o) {
        var sorted = {}, key, a = [];
        for (key in o) {
            if (o.hasOwnProperty(key)) {
                a.push(key);
            }
        }
        a.sort();
        for (key = 0; key < a.length; key += 1) {
            sorted[a[key]] = o[a[key]];
        }
        return sorted;
    };

    /**
     * Start to collect the setting of YUI modules under
     * specified folder.
     *
     * @method collect
     * @public
     * @param path {String} The collecting path.
     * @param ignore {String} The ignoring list by comma.
     * @param callback {Function} The callback function.
     *                            You can get result modules by this.
     */
    collect = function (path, ignore, callback) {
        var cmd,
            i;

        _path = path;
        // Generate command which lists matched files.
        cmd = ["find " + path + " -type f -name '*.js'"];
        if (ignore && ignore.length) {
            for (i in ignore) {
                if (ignore.hasOwnProperty(i)) {
                    cmd.push("grep -v '" + ignore[i] + "'");
                }
            }
        }
        cmd.push("xargs grep 'YUI.add'");
        cmd.push("cut -d: -f1");

        _exec(cmd.join("|"), function (error, stdout, stderr) {
            var fileList,
                i;
            fileList = stdout.split("\n");
            for (i in fileList) {
                if (fileList.hasOwnProperty(i)) {
                    _file = fileList[i];
                    try {
                        require(fileList[i]);
                    } catch (e) {} // Ignore any errors.
                }
            }
            callback(_sortObject(_modules));
        });
    };

    return {
        collect: collect
    };

}());
