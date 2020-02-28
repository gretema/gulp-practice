// 引入 gulp
const gulp = require('gulp');
// gulp-load-plugins
const $ = require('gulp-load-plugins')();
// 引入 SASS 編譯器
$.sass.compiler = require('node-sass');
// 引入 PostCSS
const autoprefixer = require('autoprefixer');
// 引入壓縮 css 的套件
const minimist = require('minimist');
// 引入 Browsersync
const browserSync = require('browser-sync').create();

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
    .pipe($.sourcemaps.init())
    .pipe($.sass().on('error', $.sass.logError))
    .pipe($.postcss(plugins))
    .pipe($.if(options.env === 'prod', $.cssnano()))
    .pipe($.sourcemaps.write('.')) // 在括號中加入'.'
    .pipe(gulp.dest('./public/css'));
});

gulp.task('sass:watch', () => {
  gulp.watch('./sass/**/*.scss', ['sass']);
});

// Babel
gulp.task('babel', () => {
  return gulp.src('./src/js/**/*.js')
    .pipe($.babel({
      presets: ['@babel/env']
    }))
    .pipe($.concat('all.js'))
    .pipe($.if(options.env === 'prod', $.uglify()))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('./public/js'));
});

// 壓縮圖片
gulp.task('image', () => {
  return gulp.src('./src/img/**/*')
    .pipe($.if(options.env === 'prod', $.image()))
    .pipe(gulp.dest('./public/img/'));
});

// Static server
gulp.task('browser-sync', function () {
  browserSync.init({
    server: {
      baseDir: "./public", // 要指向到要模擬的伺服器資料夾，也就是 public
      reloadDebounce: 3000 // 每次重新整理必須間格 3 秒
    },
    port: 8080
  });
});

// Server 同步更新變更：監聽 HTML、SCSS、JS，當它們有變化的時候就執行特定的 task
gulp.task('watch', gulp.parallel('browser-sync', () => {
  gulp.watch('./src/**/*.html', gulp.series('copyHTML'));
  gulp.watch('./src/sass/**/*.scss', gulp.series('scss'));
  gulp.watch('./src/js/**/*.js', gulp.series('babel'));
}));

// 刪除 public 再重新生成
gulp.task('clean', () => {
  return gulp.src('./public', { read: false })
    .pipe($.clean());
});

// 同步執行 Tasks
gulp.task('default', gulp.series('copyHTML', 'scss', 'babel', 'image', 'watch'));

// build 任務佇列: 指令為 gulp bulid --env prod
gulp.task('bulid', gulp.series('clean', 'copyHTML', 'scss', 'babel', 'image'));

// 部署至 gh-pages
gulp.task('deploy', () => {
  return gulp.src('./public/**/*')
    .pipe($.ghPages());
});