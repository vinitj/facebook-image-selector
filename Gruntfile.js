"use strict";
module.exports = function (grunt) {
    grunt.initConfig({
        react: {
            jsx: {
                files: [
                    {
                        expand: true,
                        cwd: 'jsx/',
                        src: [ '*.jsx' ],
                        dest: 'lib/',
                        ext: '.js'
                    }
                ]
            }
        },
        less: {
            development: {
                options: {
                    compress: false,
                    yuicompress: false,
                    optimization: 2
                },
                files: {
                    "css/facebookImageSelector.css": "less/facebookImageSelector.less" // destination file and source file
                }
            }
        },
    });

    grunt.loadNpmTasks('grunt-react');
    grunt.loadNpmTasks('grunt-contrib-less');

    grunt.registerTask('default', ['react', 'less']);
};