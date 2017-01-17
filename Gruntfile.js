"use strict";
require("json5/lib/require");
module.exports = function (grunt) {
    // show elapsed time at the end
    if (process.env.showTimes || grunt.option("showTimes")) {
        require("time-grunt")(grunt);
    }
    // can be "dev" or "dist"
    var tmpFolder = "tmp",
        gruntFolder = "grunt",
        configHost = require("./grunt/connect-config.json5"),
        globalConfig = {
            port: process.env.port || configHost.port,
            hostName: process.env.hostName || configHost.hostName,
            tmpFolder: tmpFolder,
            gruntFolder: gruntFolder,
            // base source folder containing JS, SASS and HBS files
            srcFolder: "src",
            deployFolder: "deploy",
            bowerFolder: "bower_components"
        };


    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        globalConfig: globalConfig
    });

    grunt.log.writeln(["hostName ::::: " + globalConfig.hostName + ":" + globalConfig.port]);

    // Load grunt configurations automatically
    require("load-grunt-config")(grunt, {
        init: true,
        // data passed into config.  Can use with <%= globalConfig %>
        data: {
            globalConfig: globalConfig
        }
    });
    // task are under ./grunt/tasks.js
};