#!/usr/bin/env node
/**
 * YUI Config Collector
 *
 * The purpose of this script is to collect module settings
 * of customized YUI module files. By doing this, we don't have to maintain
 * a centralized module dependencies config. Instead we can write it in
 * individual modules.
 *
 * Usage:
 * ````
 * ycc <path> --ignore <keyword> --output <output>
 * ````
 */
/*global YUI,GLOBAL */
// Make an anonymous function so that I can stop execution anytime.
(function () {

    var exec,
        argv,
        fs,
        cmd,
        i,
        path,
        ignore, // The ignore keyword list.
        modules, // The output config.
        currentFile, // Current file path.
        sortObject;

    // Define command-line options.
    argv = require("optimist")
           .usage("Collect configuration of each customized YUI modules.\n\n" +
                  "The purpose of this script is to collect module settings" +
                  "of customized YUI module files.\nBy doing this, we don't " +
                  "have to maintain a centralized module dependencies config.\n\n" +
                  "Usage: ycc <Search Path> --ignore " +
                  "[Ignore keyword List] --output [Output File]")
           .describe("ignore", "You can ignore files by providing keyword list " +
                     "which separate by common")
           .describe("output", "Output the result to a file.")
           .check(function(o) {
               // The path must exist.
               if (!o._[0]) {
                   throw new Error("You must at least provide path.");
               }
               if (!require("path").existsSync(o._[0])) {
                   throw new Error("The path you provide doesn't exist.");
               }
           })
           .argv;

    path = argv._[0];
    exec = require("child_process").exec;
    fs = require("fs");
    modules = {};

    /**
     * Sort object items by key.
     *
     * @method sortObject
     * @private
     * @param o {Object} The input object.
     * @return {Object} The sorted object.
     */
    sortObject = function (o) {
        var sorted = {}, key, a = [];
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
    };

    // Add YUI as global variable to prevent undefined error.
    GLOBAL.YUI = function () {};

    // Get module config by making a new YUI.add method.
    YUI.add = function (name, callback, version, config) {
        var i;
        if (!config) {
            return;
        }
        modules[name] = {};

        // Append each property to the new object.
        for (i in config) {
            if (config.hasOwnProperty(i)) {
                if (i === "requires") {
                    // Beautifying the output.
                    modules[name].requires = config.requires.sort();
                } else {
                    module[name][i] = config[i];
                }
            }
        }

        // Append file path.
        if (!module[name].js) {
            modules[name].js = currentFile.replace(path, "");
        }
    };

    // Generate command.
    cmd = ["find " + path + " -type f -name '*.js'"];
    if (argv.ignore && argv.ignore.split(",").length) {
        ignore = argv.ignore.split(",");
        for (i in ignore) {
            if (ignore.hasOwnProperty(i)) {
                cmd.push("grep -v '" + ignore[i] + "'");
            }
        }
    }
    cmd.push("xargs grep 'YUI.add'");
    cmd.push("cut -d: -f1");

    modules = {};
    exec(cmd.join("|"), function (error, stdout, stderr) {
        var fileList,
            i,
            output;
        fileList = stdout.split("\n");
        for (i in fileList) {
            if (fileList.hasOwnProperty(i)) {
                currentFile = fileList[i];
                try {
                    require(fileList[i]);
                } catch (e) {} // Ignore any errors.
            }
        }
        modules = sortObject(modules);
        output = argv.output;
        if (output) {
            fs.writeFileSync(output, JSON.stringify(modules, null, 4)); // 4 spaces.
        } else {
            console.log(modules);
        }
    });
}());
