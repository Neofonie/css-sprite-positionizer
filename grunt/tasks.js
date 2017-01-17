module.exports = function (grunt) {
    var globalConfig = grunt.config("globalConfig");

    /**
     * Main task, used to show on server, includes watcher.
     */
    grunt.registerTask("serve", [
        "deploy",
        "connect:deploy",
        "watch"
    ]);

    grunt.registerTask("deploy", [
        "clean:deploy",
        "assembleBuild",
        "copyDeploy",
        "copy:bower"
    ]);

    /**
     * Default task is "serve"
     *
     * Usage:
     *      grunt
     *      grunt --env=dev
     *      grunt --env=dist
     */
    grunt.registerTask("default", ["serve"]);
};