const gulp       = require('gulp');
const rename     = require('gulp-rename');
const uglify     = require('gulp-uglify');
const minifyCss  = require('gulp-clean-css');

gulp.task('css', function() {
  gulp.src('./src/css/validator.css')
    .pipe(minifyCss({
      compatibility: 'ie8',
      advanced: false,
      keepSpecialComments: '1'
    }))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./dist'));
});

gulp.task('js', function() {
  gulp.src('./src/js/validator.js')
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./dist'));
});


gulp.task('default', ['css', 'js']);