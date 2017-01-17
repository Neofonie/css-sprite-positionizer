module.exports = {
    deploy: {
        options: {
            force: true
        },
        files: [
            {
                dot: true,
                src: [
                    "<%= globalConfig.deployFolder %>"
                ]
            }
        ]
    }
};