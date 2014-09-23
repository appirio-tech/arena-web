/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This controller handles chat area related logic.
 *
 * Changes in version 1.1 (Module Assembly - Web Arena UI Fix):
 * - Many simple changed (syntax) to clean the file and pass jslint.
 * - Changed userProfile.username to userProfile.handle to display correct information
 * - Added $rootScope to the list of parameters
 *
 * Changes in version 1.2 (Module Assembly - Web Arena UI - Chat Widget):
 * - Updated to use real data.
 *
 * Changes in version 1.3 (Module Assembly - Web Arena UI - Phase I Bug Fix):
 * - Moved the function for calculating rating colors to baseCtrl.js to enable global usage.
 *
 * Changes in version 1.4 (Module Assembly - Web Arena UI - Division Summary):
 * - Removed $timeout and socket.
 * - Moved waitingCoderInfo, modalTimeoutPromise, setTimeoutModal and showCoderInfo
 *   to baseCtrl
 *
 * Changes in version 1.5 (Module Assembly - Web Arena UI - Phase I Bug Fix 2):
 *  - Added new variable talkToClass, to show correct user color in member selection dropdown after selecting
 *  - Moved show coder info to base controller
 *
 * Changes in version 1.6 (Module Assembly - Web Arena UI - Phase I Bug Fix 3):
 * - Fixed the issues in chat area.
 *
 * Changes in version 1.7 (Module Assembly - Web Arena UI - Phase I Bug Fix 4):
 * - Fixed the issues in chat area.
 *
 * Changes in version 1.8 (Module Assembly - Web Arena - Local Chat Persistence):
 * - Clear the chat history while changing the room.
 *
 * @author dexy, amethystlei, ananthhh, flytoj2ee, TCASSEMBLER
 * @version 1.8
 */
'use strict';
/*global require, module, angular, $, window, document */
/*jshint strict:false*/
/*jslint plusplus: true*/
/**
 * The helper.
 *
 * @type {exports}
 */
var helper = require('../helper');

/**
 * The main controller for chat area.
 *
 * @type {*[]}
 */
var chatAreaCtrl = ['$scope', '$rootScope', 'socket', '$timeout', function ($scope, $rootScope, socket, $timeout) {
    var roundData,
        rebuildAllScrollbar = function () {
            $scope.$broadcast('rebuild:methods');
            $scope.$broadcast('rebuild:members');
            $scope.rebuildScrollbar('info');
            $scope.$broadcast('rebuild:chatboard');
        };

    $scope.showRatingKey = true;
    $scope.showRegistrant = false;
    $scope.showMemberHere = true;
    $scope.collapseRatingKey = true;
    $scope.collapseMemberHere = false;
    $scope.collapseRegistrant = false;
    $scope.disableSelect = true;
    // array of rating key dropdown
    $scope.ratingKeyArray = [
        {name: "2200+",     class: "rating-red"},
        {name: "1500-2199", class: "rating-yellow"},
        {name: "1200-1499", class: "rating-blue"},
        {name: "0900-1199", class: "rating-green"},
        {name: "0001-0899", class: "rating-grey"},
        {name: "Non-Rated", class: "rating-none"},
        {name: "Admin",     class: "rating-admin"}
    ];
    $scope.findMode = false;
    $scope.findText = "";
    $scope.matchCheck = false;
    $scope.whosHereOrderPredicate = 'name.toLowerCase()';
    $scope.registrantOrderPredicate = 'userName.toLowerCase()';
    $scope.methodIdx = 1;
    $rootScope.memberIdx = null;
    $scope.chatText = "";
    $scope.methodsArray = [
        "Admins",
        "General",
        "Me",
        "Question",
        "Reply To",
        "Whisper"
    ];
    $scope.ratingKeyScrollHeight = '';
    $scope.registrantsScrollHeight = '';
    $scope.whosHereScrollHeight = '';

    $scope.fontSizes = [
        "Small",
        "Medium",
        "Large"
    ];
    $scope.currentFontSize = "Medium";

    /**
     * Sets the font size.
     * @param size - the font size.
     */
    $scope.setFontSize = function (size) {
        $scope.currentFontSize = size;
    };

    if ($rootScope.currentRoomInfo.roomType === helper.ROOM_TYPE_ID.LobbyRoom) {
        // set lobby room menu
        $rootScope.roomMenu = $rootScope.lobbyMenu;
    } else {
        // set competing room menu
        $rootScope.roomMenu = {};
        roundData = $rootScope.roundData[$rootScope.currentRoomInfo.roundID];
        if (roundData) {
            // for now, only list the room assigned to the user in competing room,
            // simply remove the conditions to show more rooms.
            angular.forEach(roundData.coderRooms, function (room) {
                if (+room.roomID === +$rootScope.currentRoomInfo.roomID) {
                    $rootScope.roomMenu[room.roomID] = room;
                }
            });
            if (angular.isDefined(roundData.adminRoom) && +roundData.adminRoom.roomID === +$rootScope.currentRoomInfo.roomID) {
                $rootScope.roomMenu[roundData.adminRoom.roomID] = roundData.adminRoom;
            }
        }
    }

    if ($rootScope.isEnteringRoom) {
        $rootScope.$broadcast('rebuild:chatboard');
        socket.emit(helper.EVENT_NAME.EnterRequest, {roomID: -1});
    }


    /**
     * Initializes showRegistrant by directive's attribute, default to false, not to show the registrants section.
     *
     * @param {string} registrantsConfig indicates whether the registrants section should show.
     */
    this.init = function (registrantsConfig) {
        if (registrantsConfig !== undefined && registrantsConfig === "true") {
            $scope.showRegistrant = true;
            $scope.registrantsArray = $rootScope.roomData[$rootScope.currentRoomInfo.roomID].coders;
        }
        rebuildAllScrollbar();
    };

    /**
     * Gets the title of the current room.
     *
     * @returns {string} the room title
     */
    $scope.getRoomTitle = function () {
        if (!angular.isDefined($rootScope.currentRoomInfo)) {
            return '';
        }
        if (!angular.isDefined($rootScope.currentRoomInfo.roomID)) {
            return '';
        }
        if (!angular.isDefined($rootScope.roomMenu[$rootScope.currentRoomInfo.roomID])) {
            return '';
        }
        return $rootScope.roomMenu[$rootScope.currentRoomInfo.roomID].roomTitle;
    };
    /**
     * Gets the ID of the current room.
     *
     * @returns {string} the ID of the current room
     */
    $scope.getCurrentRoomID = function () {
        if (!angular.isDefined($rootScope.currentRoomInfo)) {
            return -1;
        }
        return $rootScope.currentRoomInfo.roomID;
    };
    /**
     * Sets the current room with the given room ID.
     *
     * @param {(string|number)} roomID the room ID
     */
    $scope.setRoom = function (roomID) {
        if (+roomID === +$rootScope.currentRoomInfo.roomID) {
            return;
        }
        $rootScope.chatContent[roomID] = [];
        socket.emit(helper.EVENT_NAME.MoveRequest, {moveType: $rootScope.roomMenu[roomID].roomType, roomID: roomID});
        socket.emit(helper.EVENT_NAME.EnterRequest, {roomID: -1});
        $scope.$broadcast('rebuild:chatboard');
    };
    /*jslint unparam: false*/

    /**
     * Gets the chat method name.
     *
     * @param {number} methodIdx the method index
     * @returns {string} the method name
     */
    $scope.getMethodName = function (methodIdx) {
        return $scope.methodsArray[methodIdx];
    };

    /**
     * Sets the chat method.
     *
     * @param {number} index the method index
     */
    $scope.setChatMethod = function (index) {
        $scope.methodIdx = index;
        //if user choose "Admins", "General", "Me",
        // there is no need to specify a user to talk to
        // in current arena implementation. so set memberIdx to null
        if (index < 3) {
            $rootScope.memberIdx = null;
            $scope.disableSelect = true;
            $scope.disableInput = true;
            angular.element('#chatInputDiv').width(460);
            angular.element('#chatInputText').width(460);
        } else {
            $scope.disableSelect = false;
            $scope.disableInput = false;
            angular.element('#chatInputDiv').width(350);
            angular.element('#chatInputText').width(350);
        }
    };

    /**
     * Sets the find mode.
     * @param flag - the find mode flag.
     */
    $scope.setFindMode = function (flag) {
        $scope.findMode = flag;
    };

    /**
     * Gets the member name for the dropdown at the bottom of the widget.
     *
     * @param {number} memberIdx the index in the dropdown
     * @returns {string} the member name
     */
    $scope.getMemberName = function (memberIdx) {
        var msg = " ", i;
        if (memberIdx === null) {
            return " ";
        }

        for (i = 0; i < $scope.whosHereArray.length; i++) {
            if ($scope.whosHereArray[i].name === memberIdx) {
                msg = $scope.whosHereArray[i].name;
                break;
            }
        }
        return msg;
    };

    /**
     * Input the user by text field.
     */
    $scope.inputUser = function () {
        var isOpen = angular.element('#usersDropdownLi').hasClass('open'), tmp, i;

        if (!isOpen) {
            $timeout(function () {
                angular.element('#usersDropdownList').trigger('click');
            }, 10);
        }

        if ($scope.talkToUser !== '') {
            // filter it
            tmp = [];
            for (i = 0; i < $scope.whosHereArrayFullList.length; i++) {
                if ($scope.whosHereArrayFullList[i].name.toLowerCase().indexOf($scope.talkToUser.toLowerCase()) === 0) {
                    tmp.push($scope.whosHereArrayFullList[i]);
                }
            }
            $scope.whosHereArray = tmp;
        } else {
            $scope.whosHereArray = $scope.whosHereArrayFullList;
        }
        $scope.$broadcast('rebuild:whosHere');
        $scope.$broadcast('rebuild:members');
    };


    $scope.rebuildMembersScrollbar = function () {
        if ($(window).scrollTop() + $(window).height() !== $(document).height()) {
            var height = angular.element('#usersList').css('height'),
                newMargin = -36 - (+height.replace('px', ''));

            angular.element('#usersList').css("margin-top", newMargin + 'px');
        } else {
            angular.element('#usersList').css("margin-top", '0px');
        }
        $scope.$broadcast('rebuild:whosHere');
        $scope.$broadcast('rebuild:members');
    };

    /**
     * Rebuild chat methods scroll bar.
     */
    $scope.rebuildMethodsScrollbar = function () {
        if ($(window).scrollTop() + $(window).height() !== $(document).height()) {
            angular.element('#methodsList').addClass('dropdown-menu-up');
        } else {
            angular.element('#methodsList').removeClass('dropdown-menu-up');
        }

        $scope.$broadcast('rebuild:methods');
    };

    /**
     * Gets the CSS class of the member's rating.
     *
     * @param {number} memberIdx the index in the dropdown
     * @returns {string} the CSS class
     */
    $scope.getMemberRatingClass = function (memberIdx) {
        if (memberIdx === null) {
            return "";
        }
        var result = 0, i;
        for (i = 0; i < $scope.whosHereArray.length; i++) {
            if ($scope.whosHereArray[i].name === memberIdx) {
                result = $scope.whosHereArray[i].rating;
                break;
            }
        }
        return $scope.getRatingClass(result);
    };

    /**
     * Sets the member talking to.
     *
     * @param {number} index the index of the member talking to
     */
    $scope.talkTo = function (index) {
        $rootScope.memberIdx = index;
    };

    /**
     * Sets the talk-to user.
     *
     * @param {number} index the index of the member talking to
     */
    $scope.setTalkTo = function (index) {
        $scope.talkToUser = $scope.getMemberName(index);
        $scope.talkToClass = $scope.getMemberRatingClass(index);
    };

    /**
     * Rebuilds the multi ng-scrollbars in this widget.
     *
     * @param {object} bar the scroll bar(s) to rebuild
     */
    $scope.rebuildScrollbar = function (bar) {
        //the left aside have a fixed height, so we need to customize the height of each
        // ng-scrollbar which belong to registrants, who's here and rating key section.
        //
        // the height is calculate by the height of left aside, header of each section and
        // height of the rating key ul

        if (bar === 'info') {
            var sectionOpen = ($scope.collapseRatingKey === false ? 1 : 0) +
                ($scope.showRegistrant === true && $scope.collapseRegistrant === false ? 1 : 0) +
                ($scope.collapseMemberHere === false ? 1 : 0);

            if ($scope.collapseRatingKey === false) {
                $scope.ratingKeyScrollHeight = "scroll-height-" + String(sectionOpen);
                $scope.$broadcast('rebuild:ratingKey');
            }
            if ($scope.collapseRegistrant === false) {
                $scope.registrantsScrollHeight = "scroll-height-" + String(sectionOpen);
                $scope.$broadcast('rebuild:registrants');
            }
            if ($scope.collapseMemberHere === false) {
                $scope.whosHereScrollHeight = "scroll-height-" + String(sectionOpen);
                $scope.$broadcast('rebuild:whosHere');
            }
        } else if (bar === 'methods') {
            $scope.$broadcast('rebuild:methods');
        } else if (bar === 'members') {
            $scope.$broadcast('rebuild:members');
        }
    };

    /**
     * Set the reply to coder.
     * @param name - the coder handle.
     */
    $scope.setReplyToCoder = function (name) {
        $scope.setChatMethod(4);
        $scope.talkTo(name);
        $scope.setTalkTo(name);
    };

    $scope.previousSearchText = '';

    $scope.htmlEncode = function (text) {
        return $(angular.element('<div/>')).text(text).html();
    };

    $scope.revertText = function (findText, replace) {
        var i, text, resultText;
        findText = findText.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        for (i = 0; i < angular.element('.allChatText').length; i++) {
            text = $scope.htmlEncode($(angular.element('.allChatText')[i]).text());
            resultText = text.replace(new RegExp(findText, "ig"), replace);

            $(angular.element('.allChatText')[i]).html(resultText);
        }
    };

    $scope.replaceText = function (findText) {
        var wrapStart = '<span class="chat-highlight">',
            wrapEnd = '</span>',
            text,
            resultText,
            splitBySearch,
            index,
            i,
            k;

        for (i = 0; i < angular.element('.allChatText').length; i++) {
            text = $(angular.element('.allChatText')[i]).text();
            resultText = '';
            index = 0;
            if ($scope.matchCheck !== true) {
                splitBySearch = text.toLowerCase().split(findText.toLowerCase());
            } else {
                splitBySearch = text.split(findText);
            }

            for (k = 0; k < splitBySearch.length; k++) {
                resultText = resultText + $scope.htmlEncode(text.substring(index, index + splitBySearch[k].length));
                index = index + splitBySearch[k].length;
                resultText = resultText + wrapStart + $scope.htmlEncode(text.substring(index, index + findText.length)) + wrapEnd;
                index = index + findText.length;
            }

            $(angular.element('.allChatText')[i]).html(resultText);
        }
    };

    $scope.inputSearchText = function () {

        if ($scope.previousSearchText !== '') {
            $scope.revertText('<span class="chat-highlight">' + $scope.htmlEncode($scope.previousSearchText) + '</span>',
                $scope.htmlEncode($scope.previousSearchText));
        }

        if ($scope.findText !== '') {
            $scope.replaceText($scope.findText);
        }

        $scope.previousSearchText = $scope.findText;

    };

    $scope.changeMatchCheck = function () {
        $scope.inputSearchText();
    };

    /**
     * Get chat content by room id.
     * @returns {*} the chat content.
     */
    $scope.getChatContent = function () {
        var str =  '';
        if (!$rootScope.chatContent) {
            return [];
        }
        return $rootScope.chatContent[$rootScope.currentRoomInfo.roomID + str];
    };

    /**
     * Submits the text content according to the chat method selected.
     */
    $scope.chatSubmit = function () {
        var msg, tmpName = '', i;
        if ($scope.chatText === '') {
            return;
        }
        if ($scope.chatText.length > helper.MAX_CHAT_LENGTH) {
            $scope.openModal({
                title: 'Error',
                message: 'You have entered ' + $scope.chatText.length +
                    ' characters. Please limit your message size to ' + helper.MAX_CHAT_LENGTH + ' characters.',
                enableClose: true
            });
            return;
        }
        if ($scope.methodIdx >= 4) {
            if ($scope.talkToUser !== '') {
                for (i = 0; i < $scope.whosHereArray.length; i++) {
                    if ($scope.whosHereArray[i].name === $scope.talkToUser) {
                        tmpName = $scope.talkToUser;
                        break;
                    }
                }
            }
            // Reply-To / Whisper chat must have a recipient.
            if ($scope.talkToUser === undefined || $scope.talkToUser === '' || tmpName === '') {
                $scope.openModal({
                    title: 'Error',
                    message: 'You need to enter who the message is going to',
                    enableClose: true
                });
                $scope.chatText = "";
                return;
            }
        }

        switch ($scope.methodIdx) {
        case 0:
            msg = 'admins: ' + $scope.chatText + '\n';
            break;
        case 1:
            msg = $scope.chatText + '\n';
            break;
        case 2:
            msg = '/me ' + $scope.chatText + '\n';
            break;
        case 3:
            msg = '/moderator ' + $scope.chatText + '\n';
            break;
        case 4:
            msg = $scope.talkToUser + ': ' + $scope.chatText + '\n';
            break;
        case 5:
            msg = '/msg ' + $scope.talkToUser + ' ' + $scope.chatText + '\n';
            break;
        default:
        }
        socket.emit(helper.EVENT_NAME.ChatRequest, {msg: msg, roomID: $rootScope.currentRoomInfo.roomID, scope: $rootScope.chatScope});
        $scope.chatText = "";
    };
}];

module.exports = chatAreaCtrl;
