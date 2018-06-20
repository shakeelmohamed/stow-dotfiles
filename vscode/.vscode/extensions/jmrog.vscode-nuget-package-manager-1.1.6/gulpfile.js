const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const gxml = require('gulp-xml2js');
const rename = require('gulp-rename');

const projFileMatcher = /\.[fc]sproj$/;
const mockPath = 'test/mocks';

gulp.task('generate-json', (callback) => {
    fs.readdir(mockPath, (err, files) => {
        const numFiles = files.length;
        let numFilesPiped = 0;

        files.forEach((file) => {
            if (projFileMatcher.test(file)) {
                gulp.src(path.resolve(mockPath, file))
                    .pipe(gxml())
                    .pipe(rename((path) => path.extname = '.json'))
                    .pipe(gulp.dest(path.join('.', 'out', mockPath)))
                    .on('end', () => ++numFilesPiped !== numFiles || cb())
            }
        });
    });
});

gulp.task('copy-mock-files', () => {
    gulp.src(path.join(mockPath, 'mockProject', '**', '*'))
        .pipe(gulp.dest(path.join('.', 'out', mockPath, 'mockProject')));
});

gulp.task('prepare-files', ['copy-mock-files', 'generate-json']);
