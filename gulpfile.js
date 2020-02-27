// 引入 gulp
const gulp = require('gulp');
// 引入 SASS 編譯器
const sass = require('gulp-sass');
sass.compiler = require('node-sass');
// 引入 Source Map
const sourcemaps = require('gulp-sourcemaps');
// 引入 PostCSS
// const autoprefixer = require('gulp-autoprefixer');
const autoprefixer = require('autoprefixer');
const postcss = require('gulp-postcss');
const cssnano = require('gulp-cssnano');
// 引入壓縮 css 的套件
const minimist = require('minimist');
const gulpif = require('gulp-if');
// 引入 Babel
const babel = require('gulp-babel');

// 判斷 dev 與 prod 模式
let envOptions = {
  string: 'env',
  default: {
    env: 'develop'
  }
};

let options = minimist(process.argv.slice(2), envOptions);
// 現在開發狀態
console.log(options);

// 把 src/index.html 複製一份到 public 中
// return 不可少，gulp.src() 是指檔案的來源
// 使用 **/*.html 將 src 底下的 HTML 通通做處理
// 後面就會使用一個 pipe 來接著 (概念就像水管一樣一直接)
// 內容輸出的目錄放在 gulp.dest() 裡面
gulp.task('copyHTML', () => {
  return gulp.src('./src/**/*.html')
    .pipe(gulp.dest('./public/'));
})
// 在 cmd 輸入 gulp copyHTML 指令，就會產生一個 public 目錄

// 複製 gulp-sass npm 網站上的 Basic Usage
// 使用 Source Map
// 但是要改進入點跟輸出點
gulp.task('scss', () => {
  const plugins = [
    autoprefixer(),
  ];
  return gulp.src('./src/sass/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(plugins))
    .pipe(gulpif(options.env === 'prod', cssnano()))
    .pipe(sourcemaps.write('.')) // 在括號中加入'.'
    .pipe(gulp.dest('./public/css'));
});

gulp.task('sass:watch', () => {
  gulp.watch('./sass/**/*.scss', ['sass']);
});

// Babel
gulp.task('babel', () => {
  return gulp.src('./src/js/**/*.js')
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(gulp.dest('./public/js'));
});