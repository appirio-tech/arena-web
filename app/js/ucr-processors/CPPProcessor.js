/*
 * Copyright (C) 2015 TopCoder Inc., All Rights Reserved.
 */
'use strict';
/*global module, require*/
/*jslint plusplus: true*/

/**
 * Pre-Processor for TopCoder submissions. (C++ Version)
 * Used to determine the percentage of code that a submission uses.
 * If the percentage of unused code is more than 30% then a warning message is displayed.
 *
 * @author Sky_
 * @version 1.0
 *
 * Known problems:
 * - no discrimination is made between methods with the same name.
 *   This means that if one method is seen then the other method is also counted as seen.
 * - white space characters are not counted - even if they are inside Strings and characters.
 * - do not use the following inside Strings and characters:
 *   '{', '}', "\n", "\t" and 'space' (see above problem)
 * - methods that have the same name as their class are constructors. All constructors of a seen class are also seen.
 * - all operator methods are seen
 * - #ifdef and #endif are not properly handled
 * 
 * - I am not sure if comparators are properly implemented in CPP processor.
 *   Backend expects syntax:
 *   `class Foo Comparator {`
 *   or
 *   `class Foo Comparable {`
 *   but this syntax is not valid for C++ and we must add #defines:
 *   `#define Comparator`
 *   or
 *   `#define Comparable`
 */
var helper = require("./ProcessorHelper");
/**
 * Create a new instance of CPP Processor
 * @param {String} className the entry point class name
 * @param {String} methodName the entry point method name
 * @param {String} originalCode the user's code to test
 * @constructor
 */
function CPPProcessor(className, methodName, originalCode) {
    var code,
        //ASSUME that there can be at most 100 methods
        MAX_METHODS = 100,
        methods = [], //name, class, start, finish, seen
        //ASSUME that there can be at most 20 classes
        MAX_CLASSES = 20,
        classes = [], //name, start, finish, seen, isComparator
        //ASSUME that there can be at most 1000 defines
        MAX_DEFINES = 1000,
        defines = [],
        TYPEDEF_PATTERN = new RegExp("^typedef\\s+(\\w.*\\W)(\\w+)\\s*;$"),
        i,
        k;

    /**
     * Records all defines of the program
     */
    function getDefines() {
        var cur = 0, to, from, defineStart, typedefStart, nextColon, matcher, nextEnter, token, temp;

        while (true) {
            defineStart = code.indexOf("#define ", cur);
            typedefStart = code.indexOf("typedef", cur);
            if (defineStart < 0 && typedefStart < 0) {
                break;
            }

            if (defineStart < 0 || (typedefStart >= 0 && typedefStart < defineStart)) { //its a typedef
                nextColon = code.indexOf(";", typedefStart);
                if (nextColon < 0) {
                    break;
                }

                matcher = TYPEDEF_PATTERN.exec(code.substring(typedefStart, nextColon + 1));
                if (matcher) {
                    to = matcher[1].trim();
                    from = matcher[2];
                    defines.push([from, to, typedefStart, nextColon, "not seen"]);
                }

                cur = nextColon + 1;
            } else {   //its a #define
                nextEnter = code.indexOf("\n", defineStart);
                if (nextEnter < 0) {
                    break;
                }

                token = helper.split(code.substring(defineStart, nextEnter), " ");
                token.shift();
                from = token.shift();
                to = "";

                if (defineStart + ("#define " + from + " ").length < nextEnter) {
                    to = code.substring(defineStart + ("#define " + from + " ").length, nextEnter);
                }

                //deal with ( case
                temp = from.indexOf("(");
                if (temp >= 0) {
                    from = from.substring(0, temp);
                }

                defines.push([from, to, typedefStart, nextEnter, "not seen"]);
                cur = nextEnter + 1;
            }

        }
    }

    /**
     * Record all method details
     * @param {String} name1 the method name
     * @param {String} name2 the class name
     * @param {Number} start the start location of the method
     * @param {Number} end the end location of the method
     */
    function addMethod(name1, name2, start, end) {
        var method = [name1, name2, start, end];
        methods.push(method);
        if (method[0] === methodName) {
            method[4] = "seen";
        } else {
            method[4] = "not seen";
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
        var classToAdd = [name, start, end];
        classes.push(classToAdd);
        if (classToAdd[0] === className || classToAdd[0] === "public") {
            classToAdd[3] = "seen";
        } else {
            classToAdd[3] = "not seen";
        }
        if (isComparator === "Comparator" || isComparator === "Comparable") { //check if class is a Comparator class
            classToAdd[4] = "true";
        } else {
            classToAdd[4] = "false";
        }
    }

    /**
     * Records all classes and methods of the program
     */
    function getClassesAndMethods() {
        var count = 0,
            lastCount = -1,
            currentName = [],
            currentClass = ["public"],
            methodClass = [],
            currentIsComparator = [""],
            currentStart = [],
            currentLocation = ["nothing"],
            ok,
            i2,
            isClass,
            classStart2,
            classStart,
            classWords,
            thisName,
            isComparator,
            leftBracket,
            methodStart,
            methodWords,
            nameToAdd,
            token;
        addClass("public", 0, code.length - 1, "");

        for (i = 0; i < code.length; i++) {
            if (code.charAt(i) === '{') {
                count++;
                ok = (code.lastIndexOf("=", i) < Math.max(code.lastIndexOf(")", i), Math.max(code.lastIndexOf("class ", i), code.lastIndexOf("struct ", i))));

                if (ok && currentLocation[currentLocation.length - 1] !== "inMethod") {
                    isClass = (code.lastIndexOf("class ", i) > code.lastIndexOf("(", i) || code.lastIndexOf("struct ", i) > code.lastIndexOf("(", i));

                    if (isClass) {    //start of a class
                        classStart2 = -1;
                        if (code.lastIndexOf("class ", i) > code.lastIndexOf("struct ", i)) {  //its a class
                            classStart2 = code.lastIndexOf("class ", i);
                        } else {       //its a struct
                            classStart2 = code.lastIndexOf("struct ", i);
                        }

                        classStart = code.lastIndexOf("\n", classStart2) + 1;
                        if (classStart < 0) {
                            classStart = 0;
                        }

                        classWords = helper.split(code.substring(classStart2, i), " ");
                        classWords.shift();
                        thisName = classWords.shift();
                        isComparator = classWords.shift();

                        currentClass.push(thisName);
                        currentName.push(thisName);
                        currentStart.push(classStart);
                        currentLocation.push("inClass");
                        currentIsComparator.push(isComparator);
                        lastCount++;
                    } else {  //start of a method
                        leftBracket = code.lastIndexOf("(", i);
                        methodStart = code.lastIndexOf("\n", leftBracket) + 1;
                        if (methodStart < 0) {
                            methodStart = 0;
                        }

                        methodWords = helper.split(code.substring(methodStart, leftBracket), " ");
                        nameToAdd = "";
                        if (methodWords[methodWords.length - 1].indexOf("::") >= 0) {
                            token = helper.split(methodWords[methodWords.length - 1], ":");
                            methodClass.push(token.shift());
                            nameToAdd = token.shift();

                        } else {
                            methodClass.push(currentClass[currentClass.length - 1]);
                            nameToAdd = methodWords[methodWords.length - 1];
                        }

                        if (nameToAdd.charAt(0) === '&') {
                            nameToAdd = nameToAdd.substring(1);
                        }

                        currentName.push(nameToAdd);
                        currentStart.push(methodStart);
                        currentLocation.push("inMethod");
                        lastCount++;
                    }
                }
            }

            if (code.charAt(i) === '}') {
                count--;

                if (count === lastCount) { //end of something
                    if (currentLocation[currentLocation.length - 1] === "inClass") { //end of class
                        i2 = i;
                        if (i + 1 < code.length && code.charAt(i + 1) === ';') {
                            i2 = i + 1;
                        }

                        addClass(currentName[currentName.length - 1], currentStart[currentStart.length - 1], i2, currentIsComparator[currentIsComparator.length - 1]);
                        currentName.pop();
                        currentStart.pop();
                        currentClass.pop();
                        currentLocation.pop();
                        currentIsComparator.pop();
                        lastCount--;
                    } else if (currentLocation[currentLocation.length - 1] === "inMethod") { //end of method
                        addMethod(currentName[currentName.length - 1], methodClass[methodClass.length - 1], currentStart[currentStart.length - 1], i);
                        currentName.pop();
                        methodClass.pop();
                        currentStart.pop();
                        currentLocation.pop();
                        lastCount--;
                    }
                }
            }
        }
    }

    /**
     * Finds used defines
     */
    function iterateThroughDefines() {
        var finished, temp, cur;
        while (true) {
            finished = true;

            //find in methods
            for (i = 0; i < defines.length; i++) {
                if (defines[i][4] === "not seen") {
                    for (k = 0; k < methods.length; k++) {
                        if (methods[k][4] === "seen") {
                            cur = methods[k][2];
                            temp = code.indexOf(defines[i][0], cur);    //look for FROM
                            if (temp < 0) {
                                break;
                            }

                            if (temp <= methods[k][3]) {
                                defines[i][4] = "seen";
                                finished = false;
                                break;
                            }
                        }
                    }
                }
            }

            //find in other defines
            for (i = 0; i < defines.length; i++) {
                if (defines[i][4] === "not seen") {
                    for (k = 0; k < defines.length; k++) {
                        if (defines[k][4] === "seen") {
                            temp = defines[k][1].indexOf(defines[i][0]);    //find FROM new in TO old
                            if (temp >= 0) {
                                defines[i][4] = "seen";
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
     * Finds used methods and classes
     */
    function iterateThroughMethods() {
        var found, cur, finished, methodStart, classStart, m;
        while (true) {
            finished = true;
            //Find new methods
            for (i = 0; i < methods.length; i++) {
                if (methods[i][4] === "not seen") {

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

            //Find new classes
            for (i = 0; i < classes.length; i++) {
                if (classes[i][3] === "not seen") {
                    found = false;

                    //check if this class is used by other methods that are already seen
                    for (k = 0; k < methods.length; k++) {
                        if (methods[k][4] === "seen") {
                            cur = methods[k][2];
                            while (cur <= methods[k][3]) {
                                classStart = code.indexOf(classes[i][0] + " ", cur);
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

            //Find Constructor and Operator Methods
            for (i = 0; i < classes.length; i++) {
                if (classes[i][3] === "seen") {
                    for (k = 0; k < methods.length; k++) {
                        if (methods[k][4] !== "seen" && methods[k][1] === classes[i][0] && (methods[k][0] === methods[k][1] || methods[k][0].indexOf("operator") === 0)) {
                            methods[k][4] = "seen";
                            finished = false;
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
     * Count characters in given range
     * @param {String} text the text to check
     * @param {Number} start the start position
     * @param {Number} finish then end position
     * @returns {Number} the character count
     */
    function generalCount(text, start, finish) {
        var count = 0;
        for (k = start; k <= finish; k++) {
            if (text === "code" && code[k] !== ' ' && code[k] !== '\t' && code[k] !== '\n' && code[k] !== '\r') {
                count++;
            } else if (text === "originalCode" && originalCode[k] !== ' ' && originalCode[k] !== '\t' && originalCode[k] !== '\n' && originalCode[k] !== '\r') {
                count++;
            }
        }

        return count;
    }

    /**
     * Counts the amount of #line directives (only one statement is counted)
     * @returns {Number} the character count
     */
    function countLine() {
        var lineStart = code.indexOf("#line "), nextEnter;
        if (lineStart < 0) {
            return 0;
        }
        nextEnter = code.indexOf("\n", lineStart);

        return generalCount("code", lineStart, nextEnter);
    }

    /**
     * Counts the amount of seen defines
     * @returns {Number} the character count
     */
    function countDefines() {
        var count = 0;

        for (i = 0; i < defines.length; i++) {
            if (defines[i][4] === "seen") {
                count += generalCount("code", defines[i][2], defines[i][3]);
            }
        }

        return count;
    }


    /**
     * Counts the amount of auto-generated code
     * @returns {Number} the character count
     */
    function countAutoCodeInOriginalCode() {
        var auto = ["// Powered by FileEdit", "// Powered by CodeProcessor", "// Powered by PopsEdit",
                "// Powered by [KawigiEdit]", "// Powered by TZTester", "// Powered by TomekAI"],
            rightBrace = originalCode.lastIndexOf("}"),
            count = 0,
            autoIndex,
            nextEnter;
        for (i = 0; i < auto.length; i++) {
            autoIndex = originalCode.lastIndexOf(auto[i]);
            if (autoIndex > rightBrace) {
                nextEnter = originalCode.indexOf("\n", autoIndex);
                if (nextEnter < 0) {
                    nextEnter = originalCode.length - 1;
                }

                count += generalCount("originalCode", autoIndex, nextEnter);
            }
        }

        return count;
    }

    /**
     * Counts the amount of imported code
     * @returns {Number} the character count
     */
    function countImports() {
        var cur = 0,
            count = 0,
            importStart,
            nextEnter;

        while (true) {
            importStart = code.indexOf("#include ", cur);
            nextEnter = code.indexOf("\n", importStart);
            if (importStart < 0 || importStart > nextEnter) {
                break;
            }

            count += generalCount("code", importStart, nextEnter);
            cur = nextEnter + 1;

        }

        return count;
    }


    /**
     * Counts the amount of namespaces (only one statement is counted)
     * @returns {Number} the character count
     */
    function countNameSpace() {
        var count = 0,
            nameSpaceStart = code.indexOf("using namespace", 0),
            nextEnter;
        if (nameSpaceStart >= 0) {
            nextEnter = code.indexOf(";", nameSpaceStart);
            count += generalCount("code", nameSpaceStart, nextEnter);
        }

        return count;
    }


    /**
     * Counts the length of class names of seen classes
     * @returns {Number} the character count
     */
    function countClassNamesAndPublicVariables() {
        var count = 0, m, classTotal, innerClasses, innerMethods;

        for (i = 0; i < classes.length; i++) {
            if (classes[i][0] !== "public" && classes[i][3] === "seen") {
                classTotal = generalCount("code", classes[i][1], classes[i][2]);

                innerClasses = 0;
                for (m = 0; m < classes.length; m++) {
                    if (m !== i && classes[m][1] > classes[i][1] && classes[m][2] < classes[i][2]) {
                        innerClasses += generalCount("code", classes[m][1], classes[m][2]);
                    }
                }

                innerMethods = 0;
                for (m = 0; m < methods.length; m++) {
                    if (methods[m][1] === classes[i][0] && methods[m][2] > classes[i][1] && methods[m][3] < classes[i][2]) {
                        innerMethods += generalCount("code", methods[m][2], methods[m][3]);
                    }
                }

                count += classTotal - innerClasses - innerMethods;
            }
        }

        return count;
    }

    /**
     * Counts the length of global variables
     * @returns {Number} the character count
     */
    function countGlobalVariables() {
        var count = 0, cur = 0, colon, found, variableStart;

        while (true) {
            colon = code.indexOf(";", cur);
            if (colon < 0) {
                break;
            }

            found = false;
            //check if colon is inside class, method, or define
            //first check all classes
            for (i = 0; i < classes.length; i++) {
                if (classes[i][0] !== "public" && colon >= classes[i][1] && colon <= classes[i][2]) {
                    found = true;
                    cur = classes[i][2] + 1;     //go to end of method
                    break;
                }
            }

            //if not found check methods
            if (!found) {
                for (i = 0; i < methods.length; i++) {
                    if (colon >= methods[i][2] && colon <= methods[i][3]) {
                        found = true;
                        cur = methods[i][3] + 1;    //go to end of method
                        break;
                    }
                }
            }

            //if not found check defines
            if (!found) {
                for (i = 0; i < defines.length; i++) {
                    if (colon >= defines[i][2] && colon <= defines[i][3]) {
                        found = true;
                        cur = defines[i][3] + 1;    //go to end of define
                        break;
                    }
                }
            }

            //if still not found then its a global variable
            if (!found) {
                variableStart = code.lastIndexOf("\n", colon) + 1;
                if (variableStart < 0) {
                    variableStart = 0;
                }

                if (code.substring(variableStart, colon) !== "using namespace std") {
                    count += generalCount("code", variableStart, colon);
                }
                cur = colon + 1;
            }
        }

        return count;
    }

    /**
     * Counts all the code inside methods that have been seen
     * @returns {Number} the character count
     */
    function countCodeInMethods() {
        var count = 0;

        for (i = 0; i < methods.length; i++) {
            if (methods[i][4] === "seen") {
                count += generalCount("code", methods[i][2], methods[i][3]);
            }
        }

        return count;
    }

    /**
     * Count all non-space characters in the submission
     * @returns {Number} the character count
     */
    function countTotalInOriginalCode() {
        return generalCount("originalCode", 0, originalCode.length - 1);
    }

    /**
     * Check the validity of the code.
     * @returns {String} A warning message is returned if there is too much unused code
     */
    this.checkCode = function checkCode() {
        //strip comments from the original code
        code = helper.removeComments(originalCode).replace(/[\t ]+/g, " ").replace(/\r\n?/, "\n");
        getClassesAndMethods();
        iterateThroughMethods();
        getDefines();
        iterateThroughDefines();

        //if any limit is reached, backend allows the submission
        if (classes.length > MAX_CLASSES || methods.length > MAX_METHODS || defines.length > MAX_DEFINES) {
            return "";
        }
        //count used code;
        var usedCode = countClassNamesAndPublicVariables() + countCodeInMethods() + countImports() + countDefines() + countNameSpace() + countLine() + countGlobalVariables(),
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


module.exports = CPPProcessor;