/*
 * Copyright (C) 2015 TopCoder Inc., All Rights Reserved.
 */
/**
 * Contains helper methods for unused code processors
 *
 * @author Sky_
 * @version 1.0
 */
'use strict';
/*global module, angular*/
/*jslint plusplus: true*/


/**
 * The minimum length of the code to check
 * @type {number}
 */
var CODE_LIMIT = 300;

/**
 * The warning threshold
 * @type {number}
 */
var CODE_PERCENT_LIMIT = 0.3;

/**
 * The warning message
 * @type {string}
 */
var INVALID_MESSAGE = "Your submission may contain more than 30% unused code which would violate the Unused Code Rule.  Are you sure you want to submit this code?";

/**
 * Remove comments from text (comments for c++, java and c#)
 * @param {String} text the text
 * @returns {string} the code without comments
 */
function removeComments(text) {
    var ret = [],
        idx = 0,
        ptr = 0;
    while (idx < text.length) {
        //escape whole string
        if (text[idx] === '"') {
            ret[ptr++] = text[idx++];
            while (idx < text.length && text[idx] !== '"') {
                if (text[idx] === '\\') {
                    ret[ptr++] = text[idx++];
                }
                ret[ptr++] = text[idx++];
            }
            ret[ptr++] = text[idx++];
        } else if (text[idx] === '/' && text[idx + 1] === '/') { //remove inline comment 
            while (idx < text.length && text[idx] !== '\n') {
                idx++;
            }
        } else if (text[idx] === '/' && text[idx + 1] === '*') { //remove multi line comment
            idx += 4;
            while (idx < text.length && !(text[idx - 2] === '*' && text[idx - 1] === '/')) {
                idx++;
            }
        } else {
            ret[ptr++] = text[idx++];
        }
    }
    return ret.join("");
}

/**
 * Split string by token and return non-empty elements
 * @param {String} string the string to split
 * @param {String|RegExp} token the separator token
 * @returns {Array} the split result
 */
function split(string, token) {
    var arr = string.split(token), ret = [];
    angular.forEach(arr, function (item) {
        if (item) {
            ret.push(item);
        }
    });
    return ret;
}

module.exports = {
    removeComments: removeComments,
    split: split,
    CODE_LIMIT: CODE_LIMIT,
    CODE_PERCENT_LIMIT: CODE_PERCENT_LIMIT,
    INVALID_MESSAGE: INVALID_MESSAGE
};