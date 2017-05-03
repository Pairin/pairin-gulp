const Task = require('./base-task.js');
const through2 = require('through2');
const path = require('path');
const rename = require('gulp-rename');
const print = require('gulp-debug');
const AWS_SDK = require('aws-sdk');

const s3 = new AWS_SDK.S3();

class Upload extends Task {
    constructor() {
        super('upload', 'Upload the Application')
    }

    get dependencies() {
        return [
            'upload-assets',
            'upload-manifest',
            'upload-styles'
        ]
    }
}

module.exports = (gulp) => {
    return (new Upload()).toArray();
}
