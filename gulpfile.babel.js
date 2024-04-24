import gulp from "gulp";
import gpug from "gulp-pug";
import del from "del";
import ws from "gulp-webserver";
import image from "gulp-image";
import newer from "gulp-newer";
// import imagemin from "gulp-imagemin";
import dartSass from "sass";
import gulpSass from "gulp-sass";
// import autoprefixer from "gulp-autoprefixer";
import bro from "gulp-bro";
import babelify from "babelify";
import miniCSS from "gulp-csso";
import fileinclude from "gulp-file-include";
import concat from "gulp-concat";

const sass = gulpSass(dartSass);
const routes = {
  html: {
    src: "src/**/*.html",
    dest: "build/",
  },
  pug: {
    watch: "src/**/*.pug",
    src: "src/*.pug",
    dest: "build",
  },
  img: {
    src: "src/img/**/*",
    dest: "build/img",
  },
  scss: {
    watch: "src/scss/**/*.scss",
    src: "src/scss/style.scss",
    dest: "build/css",
  },
  js: {
    watch: "src/js/**/*.js",
    src: "src/js/main.js",
    dest: "build/js",
  },
  include: {
    src: "src/include/*.html",
    dest: "build/",
  },
};

const pug = () =>
  gulp.src(routes.pug.src).pipe(gpug()).pipe(gulp.dest(routes.pug.dest));

const clean = () => del(["build"]);

const webserver = () =>
  gulp.src("build").pipe(ws({ livereload: true, open: true }));

const img = () =>
  gulp
    .src(routes.img.src)
    .pipe(newer(routes.img.dest))
    .pipe(image())
    .pipe(gulp.dest(routes.img.dest));

const styles = async () => {
  const autoprefixer = (await import("gulp-autoprefixer")).default;
  return gulp
    .src(routes.scss.src)
    .pipe(concat("all.css"))
    .pipe(sass().on("error", sass.logError))
    .pipe(
      autoprefixer({
        cascade: false,
      })
    )
    .pipe(miniCSS())
    .pipe(gulp.dest(routes.scss.dest));
};

const js = () =>
  gulp
    .src(routes.js.src)
    .pipe(
      bro({
        transform: [
          babelify.configure({ presets: ["@babel/preset-env"] }),
          ["uglifyify", { global: true }],
        ],
      })
    )
    .pipe(gulp.dest(routes.js.dest));

const inc = () =>
  gulp
    .src([routes.html.src, "!" + routes.include.src])
    .pipe(
      fileinclude({
        prefix: "@@",
        basepath: "@file",
      })
    )
    .pipe(gulp.dest(routes.include.dest));

const watch = () => {
  gulp.watch(routes.pug.watch, pug);
  gulp.watch(routes.img.src, img);
  gulp.watch(routes.scss.watch, styles);
  gulp.watch(routes.js.watch, js);
};

const prepare = gulp.series([clean, img]);

const assets = gulp.series([pug, styles, js, inc]);

const live = gulp.parallel([webserver, watch]);

export const dev = gulp.series([prepare, assets, live]);
