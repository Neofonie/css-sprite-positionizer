module.exports = function (grunt) {
    var globalConfig = grunt.config("globalConfig");

    grunt.registerTask("copyDeploy", [
        "copy:deploy"
    ]);

    return {
        deploy: {
            expand: true,
            cwd: "<%= globalConfig.srcFolder %>",
            dest: "<%= globalConfig.deployFolder %>",
            src: [
                "**/*.{js,css,jpg,png}"
            ]
        },
        bower: {
            expand: true,
            flatten: true,
            dest: "<%= globalConfig.deployFolder %>/vendor",
            filter: "isFile",
            src: [
                "<%= globalConfig.bowerFolder %>/jquery/dist/jquery.js",
                "<%= globalConfig.bowerFolder %>/lodash/lodash.js"
            ]
        }
    }
};