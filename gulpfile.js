// BASE
var gulp        = require('gulp');
var watch       = require('gulp-watch');
// SYNC
var browserSync = require('browser-sync').create();
var reload      = browserSync.reload;
// COMPRESSOR
var concat      = require('gulp-concat');
var uglify      = require('gulp-uglify');
var cleanCSS    = require('gulp-clean-css');
var imagemin    = require('gulp-imagemin');
// SASS
var sass         = require('gulp-sass');
var sourcemaps   = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
// TOOLS
var rename      = require("gulp-rename");
var gulpif      = require('gulp-if');
var useref      = require('gulp-useref');
var del         = require('del');
var fs          = require('fs');
// PATH
var appPath      = './app/';
var sassPath     = appPath + 'sass/';
var bootstrapStylePath  = appPath + 'bower_components/bootstrap-sass/assets/stylesheets/';
var bootstrapFontPath   = appPath + 'bower_components/bootstrap-sass/assets/fonts/bootstrap/';
var fontawesomePath     = appPath + 'bower_components/font-awesome/';
// VARIABLES
var sassOptions = {
  errLogToConsole: true,
  outputStyle: 'expanded'
};
var autoprefixerOptions = {
  browsers: [
  "Android 2.3",
  "Android >= 4",
  "Chrome >= 20",
  "Firefox >= 24",
  "Explorer >= 8",
  "iOS >= 6",
  "Opera >= 12",
  "Safari >= 6"
  ]
};


//-----------------------------------------------------------------------
// GULP INIT     
//-----------------------------------------------------------------------


gulp.task('bootstrap-saas', function(){

    fs.stat(sassPath+'bootstrap/', function(err, stat) {
        if(err != null) {
    
            return gulp
            .src([
              '!'+bootstrapStylePath+'_bootstrap-compass.scss',
              '!'+bootstrapStylePath+'_bootstrap-mincer.scss',
              '!'+bootstrapStylePath+'_bootstrap-sprockets.scss',
              bootstrapStylePath+'**'
            ])
            .pipe(gulp.dest(appPath+'sass/bootstrap/'))
            ;
        }
    });
    
});

gulp.task('bootstrap-variables', function(){
    
    fs.stat(sassPath+'custom/', function(err, stat) {
        if(err != null) {

            return gulp
            .src(bootstrapStylePath+'bootstrap/_variables.scss')
            .pipe(rename({
                basename: "_bootstrap-variables"
            }))
            .pipe(gulp.dest(appPath+'sass/custom/'))
            ;
        }
    });
    
});

gulp.task('bootstrap-icons', function(){
    
    fs.stat(appPath+'/fonts/bootstrap/', function(err, stat) {
        if(err != null) {
    
            return gulp
            .src(bootstrapFontPath+'*')
            .pipe(gulp.dest(appPath+'fonts/bootstrap/'));
            ;
        }
    });
    
});

gulp.task('fontawesome-sass', function(){

    fs.stat(sassPath+'font-awesome/', function(err, stat) {
        if(err != null) {
    
            return gulp
            .src(fontawesomePath+'scss/*')
            .pipe(gulp.dest(appPath+'sass/font-awesome/'));
            ;
        }
    });
    
});

gulp.task('fontawesome-icons', function(){
    
    fs.stat(appPath+'/fonts/fontawesome-webfont.eot', function(err, stat) {
        if(err != null) {
    
            return gulp
            .src(fontawesomePath+'fonts/fontawesome-webfont.*')
            .pipe(gulp.dest(appPath+'fonts/'));
            ;
        }
    });
    
});

gulp.task('init', ['bootstrap-saas','bootstrap-variables', 'bootstrap-icons', 'fontawesome-sass', 'fontawesome-icons']);


//-----------------------------------------------------------------------
// SASS CONVERSION     
//-----------------------------------------------------------------------


gulp.task('sass', function(){
    
    return gulp
    .src(sassPath+'app.scss')
    .pipe(sourcemaps.init())
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(appPath+'css'))
    ;
    
});


//-----------------------------------------------------------------------
// GULP SERVE
//-----------------------------------------------------------------------


gulp.task('serve', ['sass'], function () {
    browserSync.init({
        server: "./app"
    });
    // If use MAMP & php, replace browserSync.init by this
    //  browserSync.init({
    //     proxy: "localhost:8888",
    //     startPath: '/folder-name-in-htdocs/app/index.php'
    // });
    gulp.watch("./app/sass/*.scss",['sass']);
    gulp.watch("./app/css/*.css").on('change', browserSync.reload);
    gulp.watch("./app/js/*.js").on('change', browserSync.reload);
    gulp.watch("./app/**/*.{html,php}").on('change', browserSync.reload);
    watch('app/img/**/*').on('change', browserSync.reload);
    watch('app/fonts/**/*').on('change', browserSync.reload);
    watch('app/sass/**/*').on('change', browserSync.reload);
});


//-----------------------------------------------------------------------
// GULP BUILD
//-----------------------------------------------------------------------


// Delete all images in /prod/img/ for clean
gulp.task('step1-clean', function () {
    del(['./prod/']).then(paths => {
        console.log('Deleted files and folders:\n', paths.join('\n'));
    });
});

// Copy files (html or php files, fonts, favicon)
gulp.task('step2-copy', function () {
    gulp.src('./app/favicon.ico')
        .pipe(gulp.dest('./prod/'));
    gulp.src('./app/fonts/**/*')
        .pipe(gulp.dest('./prod/fonts/'));

});


// Minify images
gulp.task('step3-imagemin', function () {
    gulp.src('./app/*.ico')
        .pipe(gulp.dest('./prod/'));
    gulp.src('./app/img/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('./prod/img/'))
});


// Useref to compress all css and js files (presents in build tag in ./app/index.html)
gulp.task('step4-useref', function () {
    return gulp.src('./app/*.{html,php}')
        .pipe(useref())
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', cleanCSS()))
        .pipe(gulp.dest('prod'));
});

gulp.task('build', ['step1-clean', 'step2-copy', 'step3-imagemin', 'step4-useref']);