const gulp = require('gulp')
const autoprefixer = require('gulp-autoprefixer')
const concat = require('gulp-concat')
const gulpif = require('gulp-if')
const debug = require('gulp-debug')
const uglify = require('gulp-uglify')
const plumber = require('gulp-plumber')
const named = require('vinyl-named')
const stylus = require('gulp-stylus')
const rev = require('gulp-rev')
const revReplace = require('gulp-rev-replace')
const path = require('path')
const clean = require('gulp-clean')
const webpack = require('webpack')
const webpackStream = require('webpack-stream')
const webpackConfig = require('./webpack/webpack.config')

const DEBUG = process.env.NODE_ENV !== "production"

gulp.task('clean-manifest', function () {
    return gulp.src('manifest/*.json', {read: false})
        .pipe(clean());
});

gulp.task('assets', () => {
    return gulp.src('src/assets/**/*')
        .pipe(gulp.dest('public'))
})

gulp.task('stylus', () => {
    return gulp.src('src/stylus/style.styl')
        .pipe(plumber())
        .pipe(stylus({
            compress: !DEBUG
        }))
        .pipe(autoprefixer({
            browsers: ['last 4 versions'],
            cascade: false
        }))
        .pipe(rev())
        .pipe(gulp.dest(path.join('public', 'stylesheets')))
        .pipe(rev.manifest('stylus.json'))
        .pipe(gulp.dest('manifest'))
})


const jspolyfills = [
    'src/javascripts/eventlistener-polyfill.js',
    'src/javascripts/bind-polyfill.js',
    'src/javascripts/classlist-polyfill.js',
    'src/javascripts/placeholder-polyfill.js',
]

gulp.task('compressed-polyfill', () => {
    gulp.src(jspolyfills, {base: 'src/javascripts'})
        .pipe(concat('polyfills.js'))
        .pipe(uglify())
        .pipe(gulp.dest('public/javascripts'));
});

gulp.task('compressed-js', () => {
    gulp.src('src/javascripts/live-search.js')
        .pipe(named())
        .pipe(debug({title: 'after named:'}))
        .pipe(plumber())
        .pipe(debug({title: 'after plumber:'}))
        .pipe(webpackStream(webpackConfig, webpack))
        .pipe(debug({title: 'after webpack:'}))
        .pipe(gulpif(!DEBUG, uglify()))
        .pipe(gulp.dest(path.join('public', 'javascripts')))
});

gulp.task('dist', ['clean-manifest', 'assets', 'stylus', 'compressed-polyfill', 'compressed-js'], () => {
    return gulp.src('src/assets/index.html')
        .pipe(gulpif(!DEBUG, revReplace({
            manifest: gulp.src('manifest/stylus.json'),
        })))
        .pipe(gulp.dest('public'))
})

gulp.task('watch', () => {
    gulp.watch('src/assets/**/*', ['assets'])
    gulp.watch('src/javascripts/**/*', ['compressed-polyfill', 'compressed-js'])
    gulp.watch('src/stylus/*.styl', ['stylus'])
})

gulp.task('lint', () => {
    return gulp.src(['**/*.js','!node_modules/**'])
        .pipe(require('gulp-eslint')())
        .pipe(require('gulp-eslint').failAfterError())
})

gulp.task('dev', ['dist', 'watch'], () => {
    require('gulp-nodemon')({
        script: 'src/javascripts/live-search.js',
        ignore: [
            'public/',
            'node_modules/',
            'src/',
            'test/'
        ]
    })
})
