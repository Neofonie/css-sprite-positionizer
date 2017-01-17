module.exports = function (grunt) {
    require("json5/lib/require");

    var config = require("./connect-config.json5"),
        globalConfig = grunt.config("globalConfig"),
        returnConfig;

    returnConfig = {
        options: {
            port: globalConfig.port,
            livereload: config.livereload,
            hostname: globalConfig.hostName
        },
        /**
         * Server in deploy folder.
         */
        deploy: {
            options: {
                open: true,
                target: "http://<%= globalConfig.hostName %>:<%= globalConfig.port %>/#spriteImage=sprite.png",
                base: [
                    "<%= globalConfig.deployFolder %>"
                ]
            }
        }
    };

    return returnConfig;
};