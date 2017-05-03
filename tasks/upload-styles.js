const Task = require('./base-task.js');
const through2 = require('through2');
const path = require('path');
const rename = require('gulp-rename');
const print = require('gulp-debug');
const AWS_SDK = require('aws-sdk');

const s3 = new AWS_SDK.S3();

class UploadStyles extends Task {
    constructor(gulp) {
        super('upload-styles', 'Upload the application styles')
        this.gulp = gulp;
    }

    task() {
        return this.gulp.src([
                    'src/**/*.{scss,css}',
                    `!*/variables.scss`
                ])
                .pipe(rename((path) => {
                    path.dirname = `styles/${process.env.NODE_ENV}/${process.env.EnvironmentName}/${path.dirname}`;
                }))
                .pipe(print({title: 'Upload Styles'}))
                .pipe(through2.obj(function(file, enc, cb) {
                    s3.putObject({
                        Bucket: 'pairin-deployments',
                        Key: path.relative('./src', file.path),
                        Body: file.contents,
                        ACL: 'bucket-owner-full-control'
                    }, cb)
                }))
    }
}

module.exports = (gulp) => {
    return (new UploadStyles(gulp)).toArray();
}
