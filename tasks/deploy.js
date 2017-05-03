const Task = require('./base-task.js');

const runSequence = require('run-sequence').use(gulp);

class Deploy extends Task {
    constructor() {
        super('deploy', 'Deploy the application')
    }

    task(cb) {
        return runSequence(
            'clean-server',
            'copy-public',
            'build',
            'bundle',
            'upload',
            'invalidate-cache',
            cb
        );
    }
}

module.exports = (gulp) => {
    return (new Deploy()).toArray();
}
