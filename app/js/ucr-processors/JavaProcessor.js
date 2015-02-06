/*
 * Copyright (C) 2015 TopCoder Inc., All Rights Reserved.
 */
'use strict';
/*global module, require*/
/*jslint plusplus: true*/

/**
 * Pre-Processor for TopCoder submissions. (Java Version)
 * Used to determine the percentage of code that a submission uses.
 * If the percentage of unused code is more than 30% then a warning message is displayed.
 *
 * @author Sky_
 * @version 1.0
 *
 * Known problems:
 * - everything inside the Comparator class is counted
 * - no discrimination is made between methods with the same name. This means that if
 *   one method is seen then the other method is also counted as seen.
 * - white space characters are not counted - even if they are inside Strings and characters.
 * - do not use the following inside Strings and characters:
 *   '{', '}', "\n", "\t" and 'space' (see above problem)
 * - Constructors are not seen (in CPP are seen)
 * 
 * Bugs in backend:
 * - Comparator classes will never be found, because word `implements` in not properly handled
 *  see code https://github.com/appirio-tech/arena-comp-eng-client-common/blob/dev/src/main/com/topcoder/client/contestApplet/unusedCodeProcessor/JavaProcessor.java#L99
 *  For example
 *  `public class Foo implements Comparator`
 *  `thisName` is equal to `Foo`
 *  `isComparator` is equal to `implements`
 */

var helper = require("./ProcessorHelper");

/**
 * Create a new instance of Java Processor
 * @param {String} className the entry point class name
 * @param {String} methodName the entry point method name
 * @param {String} originalCode the user's code to test
 * @constructor
 */
function JavaProcessor(className, methodName, originalCode) {
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

        if (isComparator === "Comparator" || isComparator === "Comparable") { //check if class is a Comparator class
            newClass[4] = "true";
        } else {
            newClass[4] = "false";
        }
    }

    /**
     * Records all classes and methods of the program
     */
    function getClassesAndMethods() {
        var count = 0,
            lastCount = -1,
            currentName = [],
            currentClass = [],
            currentIsComparator = [],
            currentStart = [],
            currentLocation = ["nothing"],
            i,
            ok,
            isClass,
            classStart2,
            classStart,
            classWords,
            thisName,
            isComparator,
            leftBracket,
            methodStart,
            methodWords;

        for (i = 0; i < code.length; i++) {
            if (code[i] === '{') {
                count++;
                ok = code.lastIndexOf("=", i) < Math.max(code.lastIndexOf("(", i), code.lastIndexOf("class ", i));

                if (ok && currentLocation[currentLocation.length - 1] !== "inMethod") {
                    isClass = currentLocation[currentLocation.length - 1] === "nothing" || code.lastIndexOf("class ", i) > code.lastIndexOf("(", i);

                    if (isClass) { //start of a class
                        classStart2 = code.lastIndexOf("class ", i);
                        classStart = code.lastIndexOf("\n", classStart2) + 1;
                        if (classStart < 0) {
                            classStart = 0;
                        }

                        classWords = helper.split(code.substring(classStart2, i), /[ \n]/);
                        classWords.shift();
                        thisName = classWords.shift();
                        isComparator = classWords.shift();

                        currentClass.push(thisName);
                        currentName.push(thisName);
                        currentStart.push(classStart);
                        currentLocation.push("inClass");
                        currentIsComparator.push(isComparator);
                        lastCount++;
                    } else { //start of a method
                        leftBracket = code.lastIndexOf("(", i);

                        methodStart = leftBracket - 1;
                        while (code[methodStart] === ' ') {
                            methodStart--;
                        }
                        methodStart = code.lastIndexOf(" ", methodStart) + 1;

                        if (methodStart < 0) {
                            methodStart = 0;
                        }
                        methodWords = helper.split(code.substring(methodStart, leftBracket), " ");

                        currentName.push(methodWords[methodWords.length - 1]);
                        currentStart.push(methodStart);
                        currentLocation.push("inMethod");
                        lastCount++;
                    }
                }
            }

            if (code[i] === '}') {
                count--;

                if (count === lastCount) { //end of something
                    if (currentLocation[currentLocation.length - 1] === "inClass") { //end of class
                        addClass(currentName[currentName.length - 1], currentStart[currentStart.length - 1], i, currentIsComparator[currentIsComparator.length - 1]);
                        currentName.pop();
                        currentStart.pop();
                        currentClass.pop();
                        currentLocation.pop();
                        currentIsComparator.pop();
                        lastCount--;
                    } else if (currentLocation[currentLocation.length - 1] === "inMethod") { //end of method
                        addMethod(currentName[currentName.length - 1], currentClass[currentClass.length - 1], currentStart[currentStart.length - 1], i);
                        currentName.pop();
                        currentStart.pop();
                        currentLocation.pop();
                        lastCount--;
                    }
                }
            }
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
                                    if (methodStart <= (methods[k][3])) {
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
                            cur = (methods[k][2]);
                            while (cur <= (methods[k][3])) {
                                classStart = code.indexOf("new " + classes[i][0], cur);
                                if (classStart < 0) {
                                    break;
                                }
                                cur = classStart + 1;


                                //class is used here
                                if (classStart <= (methods[k][3])) {
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
     * Counts the amount of auto-generated code
     * @returns {Number} the character count
     */
    function countAutoCodeInOriginalCode() {
        var auto = ["// Powered by FileEdit", "// Powered by CodeProcessor", "// Powered by PopsEdit",  "// Powered by [KawigiEdit]"],
            rightBrace = originalCode.lastIndexOf("}"),
            count = 0,
            i,
            autoIndex;
        for (i = 0; i < auto.length; i++) {
            autoIndex = originalCode.lastIndexOf(auto[i]);
            if (autoIndex > rightBrace) {
                count += (auto[i].length - 3); //-3 spaces
            }
        }

        return count;
    }

    /**
     * Counts the amount of imports
     * @returns {Number} the character count
     */
    function countImports() {
        var cur = 0, count = 0, importStart, nextEnter;

        while (true) {
            importStart = code.indexOf("import java", cur);
            nextEnter = code.indexOf(";", cur);
            if (importStart < 0 || importStart > nextEnter) {
                break;
            }

            cur = nextEnter + 1;
            count += (nextEnter - importStart);    //don't count space between 'import' and 'java'
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

                count += classTotal - innerClasses - innerMethods;
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
                for (k = (methods[i][2]); k <= methods[i][3]; k++) {
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
     * Check the validity of the code.
     * @returns {String} A warning message is returned if there is too much unused code
     */
    this.checkCode = function checkCode() {
        code = helper.removeComments(originalCode);  //strip comments from the original code
        getClassesAndMethods();
        iterateThroughMethods();

        //if any limit is reached, backend allows the submission
        if (classes.length > MAX_CLASSES || methods.length > MAX_METHODS) {
            return "";
        }

        //count used code;
        var usedCode = countClassNamesAndPublicVariables() + countCodeInMethods() + countImports(),
            totalLength = countTotalInOriginalCode() - countAutoCodeInOriginalCode(),
            usedPercentage = usedCode / totalLength;

        if ((totalLength - usedCode) > helper.CODE_LIMIT) {
            if (usedPercentage < (1 - helper.CODE_PERCENT_LIMIT)) {
                return helper.INVALID_MESSAGE;
            }
        }
        return "";
    };
}

module.exports = JavaProcessor;