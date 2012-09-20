#!/usr/bin/env node

// TODO - Integrate https://github.com/substack/node-optimist

(function () {
    var exec = require("child_process").exec,
        fs = require("fs"),
        output = {},
        path = process.argv[2],
        child,
        currentFile;

    if (!path) {
        console.log("You must provide path (the 1st argument.)");
        return;
    }

    GLOBAL.YUI = function () {};

    output["modules"] = {};
    YUI.add = function (name, callback, version, config) {
        if (config && config.requires) {
            output["modules"][name] = {};
            output["modules"][name].js = currentFile.replace(path, "");
            output["modules"][name].requires = config.requires.sort();
            if (config.css) {
                output["modules"][name].css = config.css;
            }
            if (config.group) {
                output["modules"][name].group = config.group;
            }
        }
    };

    function sortObject(o) {
        var sorted = {},
        key, a = [];

        for (key in o) {
                if (o.hasOwnProperty(key)) {
                                a.push(key);
                        }
            }

        a.sort();

        for (key = 0; key < a.length; key++) {
                sorted[a[key]] = o[a[key]];
            }
            return sorted;
    }

    // TODO - Add ignore parameter.
    child = exec([
        "find " + path + " -type f -name '*.js'",
        "grep -v 'static/apps'",
        "grep -v 'static/index/useradmin'",
        "grep -v 'lib/miiicasa-sdk'",
        "grep -v 'lib/yui'",
        "grep -v 'lib/soundmanager'",
        "grep -v 'lib/lazyload'",
        "grep -v 'static/lab'",
        "grep -v 'lang'",
        "xargs grep 'YUI.add'",
        "cut -d: -f1",
        ].join("|"),
        function (error, stdout, stderr) {
            var fileList = stdout.split("\n");
            for (var i in fileList) {
                currentFile = fileList[i];
                try {
                    require(fileList[i]);
                } catch (e) {

                }
            }
            output = sortObject(output);
            fs.writeFileSync("module.json", JSON.stringify(output, null, 4));
        }
    );
}());
