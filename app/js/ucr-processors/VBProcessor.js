/*
 * Copyright (C) 2015 TopCoder Inc., All Rights Reserved.
 */
'use strict';
/*global module, require*/
/*jslint plusplus: true*/

/**
 * Pre-Processor for TopCoder submissions. (VB Version)
 * Used to determine the percentage of code that a submission uses.
 * If the percentage of unused code is more than 30% then a warning message is displayed.
 *
 * @author Sky_
 * @version 1.0

 * Known problems:
 *  - no discrimination is made between methods with the same name. This means that if
 *     one method is seen then the other method is also counted as seen.
 *  - white space characters are not counted - even if they are inside Strings and characters.
 *  - do not use the following inside Strings and characters:
 *    '{', '}', "\n", "\t" and 'space' (see above problem)
 * - Constructors are not seen (in CPP are seen)
 * - No support for comparators
 * - Imports are not counted if there is empty line  before first import
 * - Structures are not supported, whole code of the structure is marked as unused
 *
 */

var helper = require("./ProcessorHelper");

/**
 * Create a new instance of VB Processor
 * @param {String} className the entry point class name
 * @param {String} methodName the entry point method name
 * @param {String} originalCode the user's code to test
 * @constructor
 */
function VBProcessor(className, methodName, originalCode) {
    className = className.toLowerCase();
    methodName = methodName.toLowerCase();
    originalCode = originalCode.toLowerCase();
    var code,
        //ASSUME that there can be at most 100 methods
        MAX_METHODS = 100,
        methods = [],
        //ASSUME that there can be at most 20 classes
        MAX_CLASSES = 20,
        classes = [];

    /**
     * Record all method details
     * @param {String} name1 the method name
     * @param {String} name2 the class name
     * @param {Number} start the start location of the method
     * @param {Number} end the end location of the method
     */
    function addMethod(name1, name2, start, end) {
        var newMethod = [name1, name2, start, end];
        methods.push(newMethod);
        if (newMethod[0] === methodName) {
            newMethod[4] = "seen";
        } else {
            newMethod[4] = "not seen";
        }
    }

    /**
     * Record all class details
     * @param {String} name the class name
     * @param {Number} start the start location of the class
     * @param {Number} end the end location of the class
     * @param {String} isComparator the name of a comparator class
     */
    function addClass(name, start, end, isComparator) {
        var newClass = [name, start, end];
        classes.push(newClass);
        if (newClass[0] === className) {
            newClass[3] = "seen";
        } else {
            newClass[3] = "not seen";
        }

        if (isComparator === "comparator" || isComparator === "comparable") { //check if class is a Comparator class
            newClass[4] = "true";
        } else {
            newClass[4] = "false";
        }
    }

    /**
     * Records all classes and methods of the program
     */
    function getClassesAndMethods() {
        var currentName = [],
            currentClass = [],
            currentIsComparator = [],
            currentStart = [],
            currentLocation = ["nothing"],
            i = 0,
            classEnd2,
            classStart,
            classWords,
            thisName,
            methodEnd,
            classEnd,
            isComparator,
            leftBracket,
            methodStart,
            methodWords;

        while (i <= code.length - 1) {
            //start of a Class
            if (currentLocation[currentLocation.length - 1] === "nothing" && code.indexOf("class", i) === i) {
                classStart = code.lastIndexOf("\n", i) + 1;
                if (classStart < 0) {
                    classStart = 0;
                }
                classEnd2 = code.indexOf("\n", i);

                classWords = helper.split(code.substring(i, classEnd2), " ");
                classWords.shift();
                thisName = classWords.shift();

                isComparator = "";

                currentClass.push(thisName);
                currentName.push(thisName);
                currentStart.push(classStart);
                currentLocation.push("inClass");
                currentIsComparator.push(isComparator);
            } else if (currentLocation[currentLocation.length - 1] === "inClass" && (code.indexOf("function", i) === i || code.indexOf("sub") === i)) {
                //start of a Function or Sub 
                leftBracket = code.indexOf("(", i);
                methodStart = code.lastIndexOf(" ", leftBracket) + 1;
                if (methodStart < 0) {
                    methodStart = 0;
                }

                methodWords = helper.split(code.substring(methodStart, leftBracket), " ");

                currentName.push(methodWords[methodWords.length - 1]);
                currentStart.push(methodStart);
                currentLocation.push("inMethod");
            } else if (currentLocation[currentLocation.length - 1] === "inMethod" && (code.indexOf("end function", i) === i || code.indexOf("end sub", i) === i)) {
                //end of a Function or Sub
                methodEnd = -1;
                if (code.indexOf("end function", i) === i) {
                    methodEnd = i + "end function".length - 1;
                    i += "end function".length - 1;
                } else {
                    methodEnd = i + "end sub".length - 1;
                    i += "end sub".length - 1;
                }

                addMethod(currentName[currentName.length - 1], currentClass[currentClass.length - 1], currentStart[currentStart.length - 1], methodEnd);
                currentName.pop();
                currentStart.pop();
                currentLocation.pop();
            } else if (currentLocation[currentLocation.length - 1] === "inClass" && code.indexOf("end class", i) === i) {
                //end of a Class
                classEnd = i + "end class".length - 1;
                i += "end class".length - 1;
                addClass(currentName[currentName.length - 1], currentStart[currentStart.length - 1], classEnd, currentIsComparator[currentIsComparator.length - 1]);
                currentName.pop();
                currentStart.pop();
                currentClass.pop();
                currentLocation.pop();
                currentIsComparator.pop();
            }

            i++;
        }
    }


    /**
     * Finds used methods and classes
     */
    function iterateThroughMethods() {
        var i, m, found, found2, k, cur, finished, methodStart, classStart;
        while (true) {
            finished = true;

            //Find new methods
            for (i = 0; i < methods.length; i++) {
                if (methods[i][4] === "not seen") {
                    found2 = false;
                    for (m = 0; m < classes.length; m++) {
                        if (classes[m][0] === methods[i][1] && classes[m][3] === "seen") {
                            found2 = true;
                            break;
                        }
                    }

                    if (found2) {
                        found = false;

                        //check if this method is used by other methods that are already seen
                        for (k = 0; k < methods.length; k++) {
                            if (methods[k][4] === "seen") {
                                cur = methods[k][2];
                                while (cur <= methods[k][3]) {
                                    methodStart = code.indexOf(methods[i][0] + "(", cur);
                                    if (methodStart < 0) {
                                        break;
                                    }
                                    cur = methodStart + 1;

                                    //method is used here
                                    if (methodStart <= methods[k][3]) {
                                        methods[i][4] = "seen";
                                        found = true;
                                        break;
                                    }
                                }

                                if (found) {
                                    finished = false;
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            //Find new classes
            for (i = 0; i < classes.length; i++) {
                if (classes[i][3] === "not seen") {
                    found = false;

                    //check if this class is used by other methods that are already seen
                    for (k = 0; k < methods.length; k++) {
                        if (methods[k][4] === "seen") {
                            cur = methods[k][2];
                            while (cur <= methods[k][3]) {
                                classStart = code.indexOf("new " + classes[i][0], cur);
                                if (classStart < 0) {
                                    break;
                                }
                                cur = classStart + 1;

                                //class is used here
                                if (classStart <= methods[k][3]) {
                                    classes[i][3] = "seen";
                                    found = true;

                                    //if this is a comparator class then make all its methods seen
                                    if (classes[i][4] === "true") {
                                        for (m = 0; m < methods.length; m++) {
                                            if (methods[m][1] === classes[i][0]) {
                                                methods[m][4] = "seen";
                                            }
                                        }
                                    }

                                    break;
                                }
                            }

                            if (found) {
                                finished = false;
                                break;
                            }
                        }
                    }
                }
            }

            if (finished) {
                break;
            }
        }
    }


    /**
     * Counts the amount of imports
     * @returns {Number} the character count
     */
    function countImports() {
        var cur = 0, count = 0, importStart, nextEnter;

        while (true) {
            importStart = code.indexOf("imports", cur);
            nextEnter = code.indexOf("\n", cur);
            if (importStart < 0 || importStart > nextEnter) {
                break;
            }

            cur = nextEnter + 1;
            count += (nextEnter - importStart - 1);  //don't count space between 'Imports' and 'System'
        }

        return count;
    }


    /**
     * Counts the length of class names of seen classes
     * @returns {Number} the character count
     */
    function countClassNamesAndPublicVariables() {
        var count = 0, k, m, i, classTotal, innerClasses, innerMethods;

        for (i = 0; i < classes.length; i++) {
            if (classes[i][3] === "seen") {
                classTotal = 0;
                for (k = classes[i][1]; k <= classes[i][2]; k++) {
                    if (code[k] !== ' ' && code[k] !== '\t' && code[k] !== '\n' && code[k] !== '\r') {
                        classTotal++;
                    }
                }

                innerClasses = 0;
                for (m = 0; m < classes.length; m++) {
                    if (m !== i && classes[m][1] > classes[i][1] && classes[m][2] < classes[i][2]) {
                        for (k = classes[m][1]; k <= classes[m][2]; k++) {
                            if (code[k] !== ' ' && code[k] !== '\t' && code[k] !== '\n' && code[k] !== '\r') {
                                innerClasses++;
                            }
                        }
                    }
                }

                innerMethods = 0;
                for (m = 0; m < methods.length; m++) {
                    if (methods[m][1] === classes[i][0] && methods[m][2] > classes[i][1] && methods[m][3] < classes[i][2]) {
                        for (k = methods[m][2]; k <= methods[m][3]; k++) {
                            if (code[k] !== ' ' && code[k] !== '\t' && code[k] !== '\n' && code[k] !== '\r') {
                                innerMethods++;
                            }
                        }
                    }
                }

                count += (classTotal - innerClasses - innerMethods);
            }
        }

        return count;
    }

    /**
     * Counts all the code inside methods that have been seen
     * @returns {Number} the character count
     */
    function countCodeInMethods() {
        var count = 0, i, k;

        for (i = 0; i < methods.length; i++) {
            if (methods[i][4] === "seen") {
                for (k = methods[i][2]; k <= methods[i][3]; k++) {
                    if (code[k] !== ' ' && code[k] !== '\t' && code[k] !== '\n' && code[k] !== '\r') {
                        count++;
                    }
                }
            }
        }

        return count;
    }

    /**
     * Count all non-space characters in the submission
     * @returns {Number} the character count
     */
    function countTotalInOriginalCode() {
        var count = 0, i;

        for (i = 0; i < originalCode.length; i++) {
            if (originalCode[i] !== ' ' && originalCode[i] !== '\t' && originalCode[i] !== '\n' && originalCode[i] !== '\r') {
                count++;
            }
        }

        return count;
    }

    /**
     * Remove comments from code
     */
    function stripComments() {
        code = "";
        var i, inComment = false;

        for (i = 0; i < originalCode.length; i++) {
            if (originalCode[i] === "'" && !inComment) { // ' character is the start of a comment
                inComment = true;
            } else if (originalCode[i] === '\n' && inComment) {
                inComment = false;
            } else if (!inComment) {
                code += originalCode[i];
            }
        }
    }

    /**
     * Check the validity of the code.
     * @returns {String} A warning message is returned if there is too much unused code
     */
    this.checkCode = function checkCode() {
        stripComments();  //store stripped version of originalCode into code
        getClassesAndMethods();
        iterateThroughMethods();

        //if any limit is reached, backend allows the submission
        if (classes.length > MAX_CLASSES || methods.length > MAX_METHODS) {
            return "";
        }
        //count used code;
        var usedCode = countClassNamesAndPublicVariables() + countCodeInMethods() + countImports(),
            totalLength = countTotalInOriginalCode(),
            usedPercentage = usedCode / totalLength;
        if ((totalLength - usedCode) > helper.CODE_LIMIT) {
            if (usedPercentage < (1 - helper.CODE_PERCENT_LIMIT)) {
                return helper.INVALID_MESSAGE;
            }
        }
        return "";
    };
}

module.exports = VBProcessor;