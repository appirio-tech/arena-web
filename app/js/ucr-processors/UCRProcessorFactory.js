/*
 * Copyright (C) 2015 TopCoder Inc., All Rights Reserved.
 */
'use strict';
/*global module, require*/

/**
 * Represents factory for UCR processors
 *
 * @author Sky_
 * @version 1.0
 */

var CPPProcessor = require("./CPPProcessor");
var CSharpProcessor = require("./CSharpProcessor");
var VBProcessor = require("./VBProcessor");
var JavaProcessor = require("./JavaProcessor");

var UCRProcessorFactory = {

    /**
     * Get processor constructor for given language.
     * @param {Number} langID the language id
     * @returns {Function|Null} the constructor or null if not supported
     */
    getProcessor: function (langID) {
        switch (langID) {
        case 1:
            return JavaProcessor;
        case 3:
            return CPPProcessor;
        case 4:
            return CSharpProcessor;
        case 5:
            return VBProcessor;
        }
        return null;
    }
};


module.exports = UCRProcessorFactory;