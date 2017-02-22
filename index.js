const gulp = require('gulp-help')(require('gulp'), {hideEmpty: true});
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const gutil = require('gulp-util');
const babel = require('gulp-babel');
const rename = require('gulp-rename');
const named = require('vinyl-named');
const notifier = require('node-notifier');
const argv = require('yargs').argv;
const path = require('path');
const fontello = require('gulp-fontello');
const runSequence = require('run-sequence').use(gulp);
const archiver = require('gulp-archiver');
const del = require('del');
const fs = require('fs');
const empty = require('gulp-empty');
const AWS_SDK = require('aws-sdk');
const print = require('gulp-debug');
const through2 = require('through2');

module.exports = (ENV) => {
    process.env.NODE_ENV = process.env.BABLE_ENV = (argv.environment || 'development');

    const s3 = new AWS_SDK.S3();
    const eb = new AWS_SDK.ElasticBeanstalk({
        region: ENV.region || 'us-east-1'
    });
    const cloudfront = new AWS_SDK.CloudFront();

    function handleError(err) {
        notifier.notify({
            'title': 'Pairin Build Error',
            'message': err.message
        });
        gutil.log(gutil.colors.red(err.toString()));
        this.emit('end');
    }

    const getNextVersion = () => {
        return new Promise((resolve, reject) => {
            eb.describeApplicationVersions({}, (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(data);
            })
        }).then((data) => {
            const echeck = process.env.NODE_ENV !== 'production' ? new RegExp(`^(${process.env.NODE_ENV})\\.\\d+\\.\\d+\\.\\d+$`) : /^\.\d+\.\d+\.\d+$/;
            return data.ApplicationVersions.filter((v) => {
                return echeck.test(v.VersionLabel);
            });
        }).then((data) => {
            if (!data.length) {
                data = [{VersionLabel: '0.0.0'}];
            }
            return data.map((v) => {
                return v.VersionLabel.replace(/^\D+/, '');
            });
        }).then((data) => {
            return data.sort((a, b) => {
                const _a = a.split('.').map((v) => parseInt(v));
                const _b = b.split('.').map((v) => parseInt(v));

                if (_a[0] > _b[0]) {
                    return -1;
                } else if (_a[0] < _b[0]) {
                    return 1;
                } else if (_a[1] > _b[1]) {
                    return -1;
                } else if (_a[1] < _b[1]) {
                    return 1;
                } else if (_a[2] > _b[2]) {
                    return -1;
                } else if (_a[2] < _b[2]) {
                    return 1;
                }

                return 0;
            })
        }).then((data) => {
            const next = data[0].split('.').map((v) => parseInt(v));

            next[2]++;

            return next.join('.');
        });
    }

    const handleWebpack = function() {
        const config = require('./webpack.config.js');

        if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
            config.plugins.push(
                new webpack.DefinePlugin({
                  'process.env': {
                    NODE_ENV: JSON.stringify('production')
                  }
                }),
                new webpack.LoaderOptionsPlugin({
                    minimize: true,
                    debug: false
                }),
                new webpack.optimize.UglifyJsPlugin({
                    compress: {
                        warnings: false,
                        screw_ie8: true,
                        conditionals: true,
                        unused: true,
                        comparisons: true,
                        sequences: true,
                        dead_code: true,
                        evaluate: true,
                        if_return: true,
                        join_vars: true,
                    },
                    output: {
                        comments: false
                    },
                })
            );
        }

        return webpackStream(config, webpack, function(err, stats) {
            if (err) {
                throw new gutil.PluginError("webpack", err);
            }
        })
    }

    gulp.task('build-client', function() {
        return gulp.src(path.resolve(process.cwd(), 'src/client.js'))
            .pipe(named())
            .pipe(handleWebpack())
            .on('error', handleError)
            .pipe(gulp.dest(path.resolve(process.cwd(), 'dist/')))
            .pipe(print({title: 'Client Output'}));
    });

    gulp.task('fontello', function () {
      return gulp.src(path.resolve(process.cwd(), 'fontello.json'))
        .pipe(fontello({
            font: path.resolve(process.cwd(), '../src/fonts/fontello'),
            css: path.resolve(process.cwd(), '../src/styles/fontello'),
            assetsOnly: true
        }))
        .pipe(rename(function (path) {
            if (path.extname === '.css') {
                path.extname = '.scss';
            }
        }))
        .pipe(gulp.dest(path.resolve(process.cwd(), 'dist/')))
        .pipe(print({title: 'Fontello Output'}));
    });

    gulp.task('build-server', function() {
        const file = argv.file || 'src/**/*.{js,json}';

        const babelconfig = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), '.babelrc'), "utf8"));

        babelconfig.presets = ["react", "es2015", "stage-2"];

        babelconfig.plugins.push(["babel-plugin-remove-imports", [
            /\.(less|css|sass|scss)$/,
            /\.(jpeg|jpg|png|gif|svg)$/
        ]]);

        return gulp.src(path.resolve(process.cwd(), file), { base: './src' })
                .pipe(babel(babelconfig))
                .on('error', handleError)
                .pipe(gulp.dest(path.resolve(process.cwd(), 'server/')))
                .pipe(print({title: 'Server Output'}));
    });

    gulp.task('build',
        "Build the application",
        ['fontello', 'build-client', 'build-server'],
        function(){},
        {
            'production': 'build the application for production'
        }
    );

    gulp.task('bundle', function() {
        return gulp.src([
            path.resolve(process.cwd(), 'server*/**'),
            path.resolve(process.cwd(), 'dist*/**'),
            path.resolve(process.cwd(), 'index.js'),
            path.resolve(process.cwd(), 'package.json'),
            path.resolve(process.cwd(), 'npm-shrinkwrap.json'),
            path.resolve(process.cwd(), '.ebextensions*/**'),
        ]).pipe(archiver('bundle.zip'))
        .pipe(gulp.dest(process.cwd()))
    })

    gulp.task('upload-styles', function() {
        return gulp.src([
                    path.resolve(process.cwd(), './src/styles/**/*'),
                    `!${path.resolve(process.cwd(), './src/styles/variables.scss')}`
                ])
                .pipe(rename((path) => {
                    path.dirname = `styles/${process.env.NODE_ENV}/${ENV.EnvironmentName}/${path.dirname}`;
                }))
                .pipe(print({title: 'Upload Styles'}))
                .pipe(through2.obj(function(file, enc, cb) {
                    s3.putObject({
                        Bucket: 'pairin-deployments',
                        Key: path.relative('./src/styles', file.path),
                        Body: file.contents,
                        ACL: 'bucket-owner-full-control'
                    }, cb)
                }))
    })

    gulp.task('upload-assets', function() {
        return gulp.src(path.resolve(process.cwd(), './dist/**/*'))
                .pipe(rename({
                    dirname: `${process.env.NODE_ENV}/${ENV.EnvironmentName}/`
                }))
                .pipe(print({title: 'Upload Assets'}))
                .pipe(through2.obj(function(file, enc, cb) {
                    s3.putObject({
                        Bucket: 'assets.pairin.com',
                        Key: path.relative(path.resolve(process.cwd(), './dist'), file.path),
                        Body: file.contents,
                        ACL: 'public-read'
                    }, cb)
                }))
    });

    gulp.task('upload-manifest', function() {
        return gulp.src(path.resolve(process.cwd(), './sass-manifest.json'))
                    .pipe(rename(`pairin-${ENV.EnvironmentName}-manifest.${process.env.NODE_ENV}.json`))
                    .pipe(print({title: 'Upload Manifest'}))
                    .pipe(through2.obj(function(file, enc, cb) {
                        s3.putObject({
                            Bucket: 'pairin-deployments',
                            Key: path.relative(process.cwd(), file.path),
                            Body: file.contents,
                            ACL: 'bucket-owner-full-control'
                        }, cb)
                    }));
    })

    gulp.task('upload',
        function(cb) {

            const nextVersion = argv.version
                                ? Promise.resolve(argv.version)
                                : getNextVersion();

            nextVersion
            .then((version) => ((process.env.NODE_ENV !== 'production' ? process.env.NODE_ENV + '.' : '') + version))
            .then((version) => {
                gutil.log(gutil.colors.blue(`Uploading bundle.zip to s3/${version}`));
                return new Promise((resolve, reject) => {
                    s3.putObject({
                        Bucket: 'pairin-deployments',
                        Key: `${version}.zip`,
                        Body: fs.readFileSync(path.resolve(process.cwd(), './bundle.zip')),
                        ACL: 'bucket-owner-full-control'
                    }, (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(version);
                        }
                    })
                })
            })
            .then((version) => {
                const environmentName = 'pairin-' + ENV.EnvironmentName + (process.env.NODE_ENV !== 'production' ? '-' + process.env.NODE_ENV : '');
                gutil.log('Upload', gutil.colors.blue(`Checking if the environment ${environmentName} exists`));
                return new Promise((resolve, reject) => {
                    eb.describeEnvironments({
                        EnvironmentNames: [
                            environmentName
                        ]
                    }, (err, results) => {
                        if (err) {
                            reject(err);
                        } else if (results.Environments.length) {
                            resolve(version);
                        } else {
                            gutil.log('Upload', gutil.colors.yellow(`Environment ${environmentName} does not exist`));
                            reject(null);
                        }
                    })
                })
            })
            .then((version) => {
                return new Promise((resolve, reject) => {
                    gutil.log('Upload', gutil.colors.blue(`Attempting to create new version ${version}`));
                    eb.createApplicationVersion({
                        ApplicationName: ENV.ApplicationName,
                        VersionLabel: version,
                        SourceBundle: {
                            S3Bucket: 'pairin-deployments',
                            S3Key: `${version}.zip`
                        }
                    }, (err, results) => {
                        if (err && err.code !== 'InvalidParameterValue') {
                            reject(err);
                        } else {
                            resolve(version);
                        }
                    })
                })
            })
            .then((version) => {
                const environmentName = 'pairin-' + ENV.EnvironmentName + (process.env.NODE_ENV !== 'production' ? '-' + process.env.NODE_ENV : '');
                gutil.log('Upload', gutil.colors.blue(`Updating environment ${environmentName}`));
                return new Promise((resolve, reject) => {
                    eb.updateEnvironment({
                        EnvironmentName: environmentName,
                        VersionLabel: version
                    }, (err) => {
                        if (err) {
                            reject(err);
                        }
                        resolve();
                    })
                })
            })
            .then(cb)
            .catch((e) => {
                if (e) {
                    gutil.log(gutil.colors.red(e));
                }
                cb(e);
            });
        },
        function() {},
        {
            'version': 'set the version label'
        }
    )

    gulp.task('clean', function() {
        return del([
            path.resolve(process.cwd(), 'bundle.zip'),
            path.resolve(process.cwd(), './dist'),
            path.resolve(process.cwd(), './server')
        ]);
    })

    gulp.task('invalidate-cache', "Invalidate the AWS Cloudfront", function() {
        return new Promise((resolve, reject) => {
            cloudfront.createInvalidation({
                DistributionId: ENV.distributionId,
                InvalidationBatch: {
                    CallerReference: Date.now().toString(),
                    Paths: {
                        Quantity: 1,
                        Items: [
                            `/${process.env.NODE_ENV}/${ENV.EnvironmentName}/*`
                        ]
                    }
                }
            }, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            })
        })
    })

    gulp.task('copy-public', function() {
        return gulp.src(path.resolve(process.cwd(), 'public/**/*'))
            .pipe(gulp.dest(path.resolve(process.cwd(), 'dist/')))
            .pipe(print({title: 'Public File Output'}));
    })

    gulp.task('deploy',
        'Deploy the Application to AWS',
        function(cb) {
            runSequence(
                'clean',
                'copy-public',
                'build',
                'upload-assets',
                'bundle',
                ['upload', 'upload-manifest', 'upload-styles'],
                'invalidate-cache',
                cb
            );
        }
    )

    gulp.task('watch', "Watch for file changes", ['copy-public','fontello', 'build-client', 'build-server'], function() {
        let buildWatcher = gulp.watch(path.resolve(process.cwd(), 'src/**/*.{js,json}'), ['build-client']);
        gulp.watch(path.resolve(process.cwd(), 'src/**/*.{less,scss,css,jpeg,jpg,png,gif}'), ['build-client']);
        gulp.watch(path.resolve(process.cwd(), 'fontello.json'), ['fontello']);
        gulp.watch(path.resolve(process.cwd(), 'public/**/*'), ['copy-public']);

        buildWatcher.on('change', function(event) {
            argv.file = event.path;
            gulp.start.apply(gulp, ['build-server']);
        })
    });

    gulp.task('default', ['help']);

    return gulp;
}
