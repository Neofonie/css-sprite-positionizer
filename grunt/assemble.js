module.exports = function (grunt) {

    grunt.registerTask("assembleBuild", [
        "assemble"
    ]);

    return {
        options: {
            flatten: true,
            data: "templates/data/*.json",
            layoutdir: "templates/layouts",
            helpers: "templates/helper/*.js",
            layout: "tpl_default.hbs",
            partials: "templates/partials/**/*.hbs",
            absolute_path: "http://<%= globalConfig.hostName %>:<%= globalConfig.port %>",
            absolute_path_without_port: "http://<%= globalConfig.hostName %>"
        },
        default: {
            files: {
                "<%= globalConfig.deployFolder %>/": ["templates/pages/**/*.hbs"]
            }
        }
    }
};