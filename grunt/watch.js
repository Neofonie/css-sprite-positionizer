module.exports = function () {
    require("json5/lib/require");
    var config = require("./connect-config.json5");

    function generateConfig(){
        var options = {
            livereload: config.livereload
        };

        return {
            options: options,

            src: {
                files: [
                    "<%= globalConfig.srcFolder %>/**/*.{js,css}"
                ],
                tasks: [
                    "copyDeploy"
                ],
                options: options
            },
            // compile templates
            assemble: {
                files: [
                    "templates/**/*.{hbs,json}",
                    "templates/helpers/*.js"
                ],
                tasks: [
                    "assembleBuild"
                ],
                options: options
            }
        };
    }

    return generateConfig();
};