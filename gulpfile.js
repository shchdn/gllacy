//Подключаем галп
const gulp = require('gulp');
//Объединение файлов
const concat = require('gulp-concat');
//Добавление префиксов
const autoprefixer = require('gulp-autoprefixer');
//Минификация стилей
const cssnano = require('gulp-cssnano');
//Перенос @media
const mqpacker = require('css-mqpacker');
//Оптимизация скриптов
const uglify = require('gulp-uglify');
//Удаление файлов
const del = require('del');
//Синхронизация с браузером
const browserSync = require('browser-sync').create();
//Для препроцессоров стилей
const sourcemaps = require('gulp-sourcemaps');
//Sass препроцессор
const sass = require('gulp-sass');
//Модуль для сжатия изображений
const imagemin = require('gulp-imagemin');
const mozjpeg = require('imagemin-mozjpeg');
const pngquant = require('imagemin-pngquant');
//Модуль для создания svg спрайта
const svgstore = require('gulp-svgstore');
const svgmin = require('gulp-svgmin');
//Модуль переименовывания файлов
const rename = require('gulp-rename');
const postcss = require("gulp-postcss");

//Порядок подключения файлов со стилями
const styleFiles = [
   './source/scss/color.scss',
   './source/scss/main.scss'
]
//Порядок подключения js файлов
const scriptFiles = [
   './source/js/lib.js',
   './source/js/main.js'
]

//Таск для обработки стилей
gulp.task('styles', () => {
   //Шаблон для поиска файлов CSS
   //Всей файлы по шаблону './source/css/**/*.css'
   return gulp.src('./source/scss/**/*.+(scss|sass)')
      .pipe(sourcemaps.init())
      //Указать stylus() , sass() или less()
      .pipe(sass())
      //Объединение файлов в один
      //.pipe(concat('style.css'))
      //Добавить префиксы
      .pipe(autoprefixer({
         overrideBrowserslist: ['last 2 versions'],
         cascade: false
      }))
      //Сортировка @media
     .pipe(postcss([
         mqpacker ({
             sort: true
         })
      ]))
      //Минификация CSS
      .pipe(cssnano({
            discardComments: {removeAll: true}
        }))
      .pipe(rename({
         suffix: '.min'
      }))
      //Выходная папка для стилей
      .pipe(gulp.dest('./css'))
      .pipe(browserSync.stream());
});

//Таск для обработки скриптов
gulp.task('scripts', () => {
   //Шаблон для поиска файлов JS
   //Всей файлы по шаблону './source/js/**/*.js'
   return gulp.src(scriptFiles)
      //Объединение файлов в один
      .pipe(concat('main.js'))
      //Минификация JS
      .pipe(uglify({
         toplevel: true
      }))
      .pipe(rename({
         suffix: '.min'
      }))
      //Выходная папка для скриптов
      .pipe(gulp.dest('./js'))
      .pipe(browserSync.stream());
});

//Таск для очистки папки build
gulp.task('del', () => {
   return del(['css/*', 'img/*', 'js/*'])
});

//Таск для сжатия изображений
gulp.task('img-compress', ()=> {
   return gulp.src('./source/img/**')
   .pipe(imagemin([
      pngquant(),
      mozjpeg({
         progressive: true
      })
   ],{
         verbose: true
   }))
   .pipe(gulp.dest('./img/'))
});

//Таск для создания svg спрайта
gulp.task('svgsprite', ()=> {
   return gulp.src('./source/svgsprite/*.svg')
   .pipe(svgmin())
   .pipe(svgstore())
   .pipe(rename({basename: 'sprite'}))
   .pipe(gulp.dest('./img/'))
});

//Таск для отслеживания изменений в файлах
gulp.task('watch', () => {
   browserSync.init({
      server: {
         baseDir: "./"
      }
   });
   //Следить за добавлением новых изображений
   gulp.watch('./source/img/**', gulp.series('img-compress'))
   //Следить за добавлением новых svg
   gulp.watch('./source/svg/**', gulp.series('svgsprite'))
   //Следить за файлами со стилями с нужным расширением
   gulp.watch('./source/scss/**/*.scss', gulp.series('styles'))
   //Следить за JS файлами
   gulp.watch('./source/js/**/*.js', gulp.series('scripts'))
   //При изменении HTML запустить синхронизацию
   gulp.watch("./*.html").on('change', browserSync.reload);
});

//Таск по умолчанию, Запускает del, styles, scripts, img-compress, svgsprite и watch
gulp.task('default', gulp.series('del', gulp.parallel('styles', 'scripts', 'img-compress', 'svgsprite'), 'watch'));
