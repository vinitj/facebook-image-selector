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
                    compress: true,
                    yuicompress: true,
                    optimization: 2
                },
                files: {
                    "css/facebookImageSelector.css": "less/facebookImageSelector.less" // destination file and source file
                }
            }
        },
        browserify: {
            options: {
                transform: [ require('grunt-react').browserify ]
            },
            client: {
                src: ['lib/FacebookImageSelector.js'],
                dest: './bundle.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-react');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-browserify');

    grunt.registerTask('default', ['react', 'less', 'browserify']);
};
