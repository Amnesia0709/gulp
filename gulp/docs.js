const gulp = require('gulp');
const server = require('gulp-server-livereload');
const clean = require('gulp-clean');
const fileSystem = require('fs');
const sourceMaps = require('gulp-sourcemaps');
const groupMedia = require('gulp-group-css-media-queries');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const webpackStream = require('webpack-stream');
const webpack = require('webpack');
const babel = require('gulp-babel');
const changed = require('gulp-changed');

// Images
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');

//HTML
const fileInclude = require('gulp-file-include');
const htmlclean = require('gulp-htmlclean');
const webpHTML = require('gulp-webp-html');

// Sass
const sass = require('gulp-sass')(require('sass'));
const sassGlob = require('gulp-sass-glob');
const autoprefixer = require('gulp-autoprefixer');
const csso = require('gulp-csso');
const webpCss = require('gulp-webp-css');

//Variables
const fileIncludeSetting = {
    prefix: '@@',
    basepath: '@file'
}

const serverSetting = {
    livereload: true,
    open: true
}

const plumberConfig = (title) => {
    return {
        errorHandler: notify.onError({
            title: title,
            message: 'Error <%= error.message %>',
            sound: false
        })
    };
}

// Tasks
gulp.task('clean:docs', function(done) {
    if (fileSystem.existsSync('./docs/')) {
        return gulp.src('./docs/', {read: false})
            .pipe(clean({ force: true }))
    }
    done();
})

gulp.task('html:docs', function() {
    return gulp
        .src(['./src/html/**/*.html', '!./src/html/blocks/*.html'])
            .pipe(changed('./docs/'))
        .pipe(plumber(plumberConfig('HTML')))
        .pipe(fileInclude(fileIncludeSetting))
        .pipe(webpHTML())
        .pipe(htmlclean())
        .pipe(gulp.dest('./docs/'))
});

gulp.task('sass:docs', function() {
    return gulp
        .src('./src/scss/*.scss')
            .pipe(changed('./docs/css/'))
        .pipe(plumber(plumberConfig('Styles')))
        .pipe(sourceMaps.init())
        .pipe(autoprefixer({ cascade: false }))
        .pipe(sassGlob())
        .pipe(webpCss())
        .pipe(groupMedia())
        .pipe(sass())
        .pipe(csso())
        .pipe(sourceMaps.write())
        .pipe(gulp.dest('./docs/css'))
})

gulp.task('images:docs', function(){
    return gulp
        .src('./src/img/**/*', { encoding: false })
            .pipe(changed('./docs/img/'))
        .pipe(webp())
        .pipe(gulp.dest('./docs/img/'))

        .pipe(gulp.src('./src/img/**/*'))
        .pipe(changed('./docs/img/'))
        .pipe(imagemin({ verbose: true }))
        .pipe(gulp.dest('./docs/img/'))
})

gulp.task('fonts:docs', function(done){
    if (fileSystem.existsSync('./src/fonts/')) {
        return gulp.src('./src/fonts/**/*')
                .pipe(changed('./docs/fonts/'))
            .pipe(gulp.dest('./docs/fonts/'));
    }
    done();
})

gulp.task('files:docs', function(done){
    if (fileSystem.existsSync('./src/files/')) {
        return gulp.src('./src/files/**/*')
                .pipe(changed('./docs/files/'))
            .pipe(gulp.dest('./docs/files/'));
    }
    done();
})

gulp.task('js:docs', function(){
    return gulp
        .src('./src/js/*.js')
        .pipe(plumber(plumberConfig('JS')))
        // .pipe(babel())
        .pipe(webpackStream(require('./../webpack.config.js'), webpack))
        .pipe(gulp.dest('./docs/js'));
})

gulp.task('server:docs', function() {
    return gulp.src('./docs/')
        .pipe(server(serverSetting));
})
