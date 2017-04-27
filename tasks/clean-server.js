const path = require('path');
const Task = require('./base-task.js');
const del = require('del');
const args = require('../util/args.js');

class CleanServer extends Task {
    constructor(gulp) {
        super('clean-server', 'Clean the server folder')
        this.gulp = gulp;
    }

    task() {
        let file = args.file || 'server/**/*.{js,json}';

        if (args.file) {
            file = file.replace('src/', 'server/');
        }

        return del([file]);
    }

    get args() {
        return {
            'file': 'A specific file to remove'
        }
    }
}

module.exports = (gulp) => {
    return (new CleanServer(gulp)).toArray();
}
