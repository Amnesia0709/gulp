const gulp = require('gulp');
const fileInclude = require('gulp-file-include');
const sass = require('gulp-sass')(require('sass'));
const server = require('gulp-server-livereload');
const clean = require('gulp-clean');
const fileSystem = require('fs');
const sourceMaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const webpackStream = require('webpack-stream');
const webpack = require('webpack');
const babel = require('gulp-babel');
const imagemin = require('gulp-imagemin');
const changed = require('gulp-changed');
const sassGlob = require('gulp-sass-glob');


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

gulp.task('clean:dev', function(done) {
    if (fileSystem.existsSync('./build/')) {
        return gulp.src('./build/', {read: false})
            .pipe(clean({ force: true }))
    }
    done();
})

gulp.task('html:dev', function() {
    return gulp
        .src(['./src/html/**/*.html', '!./src/html/blocks/*.html'])
            .pipe(changed('./build/'), { hasChanged: changed.compareContents })
        .pipe(plumber(plumberConfig('HTML')))
        .pipe(fileInclude(fileIncludeSetting))
        .pipe(gulp.dest('./build/'))
});

gulp.task('sass:dev', function() {
    return gulp
        .src('./src/scss/*.scss')
            .pipe(changed('./build/css/'))
        .pipe(plumber(plumberConfig('Styles')))
        .pipe(sourceMaps.init())
        .pipe(sassGlob())
        .pipe(sass())
        .pipe(sourceMaps.write())
        .pipe(gulp.dest('./build/css'))
})

gulp.task('images:dev', function () {
	return gulp
		.src('./src/img/**/*', { encoding: false })
		.pipe(changed('./build/img/'))
		// .pipe(imagemin({ verbose: true }))
		.pipe(gulp.dest('./build/img/'));
});

gulp.task('fonts:dev', function(done){
    if (fileSystem.existsSync('./src/fonts/')) {
        return gulp.src('./src/fonts/**/*')
                .pipe(changed('./build/fonts/'))
            .pipe(gulp.dest('./build/fonts/'));
    }
    done();
})

gulp.task('files:dev', function(done){
    if (fileSystem.existsSync('./src/files/')) {
        return gulp.src('./src/files/**/*')
                .pipe(changed('./build/files/'))
            .pipe(gulp.dest('./build/files/'));
    }
    done();
})

gulp.task('js:dev', function(){
    return gulp
        .src('./src/js/*.js')
        .pipe(plumber(plumberConfig('JS')))
        // .pipe(babel())
        .pipe(webpackStream(require('./../webpack.config.js'), webpack))
        .pipe(gulp.dest('./build/js'));
})

gulp.task('server:dev', function() {
    return gulp.src('./build/')
        .pipe(server(serverSetting));
})

gulp.task('watch:dev', function(){
    gulp.watch('./src/scss/**/*.scss', gulp.parallel('sass:dev'));
    gulp.watch('./src/**/*.html', gulp.parallel('html:dev'));
    gulp.watch('./src/img/**/*', gulp.parallel('images:dev'));
    gulp.watch('./src/fonts/**/*', gulp.parallel('fonts:dev'));
    gulp.watch('./src/files/**/*', gulp.parallel('files:dev'));
    gulp.watch('./src/js/**/*.js', gulp.parallel('js:dev'));
})