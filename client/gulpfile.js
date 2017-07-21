var gulp = require('gulp')



gulp.task('css', function(){
    return gulp.src('./src/css/*')
        .pipe( gulp.dest('./build/css'))
})

gulp.task('html', function(){
    return gulp.src('./src/*.html')
        .pipe( gulp.dest('./build'))
})

gulp.task('dash', function(cb){
    console.log('--')
    cb()
})

gulp.task('font-awesome', function(){
    return gulp.src('./../node_modules/font-awesome/**')
        .pipe( gulp.dest('./build/css/font-awesome'))
})

gulp.task('watch', ['default'], function(){
    gulp.watch('./src/**', ['default'] )
})

gulp.task('default', ['dash','css','font-awesome','html'] )
