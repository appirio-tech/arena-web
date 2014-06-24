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
 * @author dexy, amethystlei
 * @version 1.3
 */
'use strict';
/*global require, module, angular */

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
var chatAreaCtrl = ['$scope', '$rootScope', '$modal', 'socket', '$timeout', function ($scope, $rootScope, $modal, socket, $timeout) {
    var roundData,
        waitingCoderInfo = false,
        modalTimeoutPromise = null,
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
        {name: "1200-1499", class: "rating-purple"},
        {name: "0900-1199", class: "rating-green"},
        {name: "0001-0899", class: "rating-grey"},
        {name: "Non-Rated", class: "rating-none"},
        {name: "Admin",     class: "rating-admin"}
    ];
    $scope.findMode = false;
    $scope.findText = "";
    $scope.matchCheck = false;
    $scope.highlightCheck = true;
    $scope.whosHereOrderPredicate = '-name.toLowerCase()';
    $scope.registrantOrderPredicate = '-userName.toLowerCase()';
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
        $rootScope.chatContent = [];
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
        socket.emit(helper.EVENT_NAME.MoveRequest, {moveType: $rootScope.roomMenu[roomID].roomType, roomID: roomID});
        socket.emit(helper.EVENT_NAME.EnterRequest, {roomID: -1});
        $rootScope.chatContent = [];
        $scope.$broadcast('rebuild:chatboard');
    };

    /**
     * Set timeout modal.
     */
    function setTimeoutModal() {
        $scope.openModal({
            title: 'Timeout',
            message: 'Sorry, the request is timeout.',
            enableClose: true
        });
        modalTimeoutPromise = null;
        waitingCoderInfo = false;
    }

    /**
     * Requests to show coder info.
     *
     * @param {string} name the name of the user
     * @param {string} userType the user type
     */
    $scope.showCoderInfo = function (name, userType) {
        if (waitingCoderInfo) {
            return;
        }
        waitingCoderInfo = true;
        if (modalTimeoutPromise) {
            $timeout.cancel(modalTimeoutPromise);
        }
        modalTimeoutPromise = $timeout(setTimeoutModal, helper.REQUEST_TIME_OUT);
        socket.emit(helper.EVENT_NAME.CoderInfoRequest, {coder: name, userType: userType});
    };

    /*jslint unparam: true*/
    // handles the PopUpGenericResponse to show coder info or error messages. 
    $scope.$on(helper.EVENT_NAME.PopUpGenericResponse, function (event, data) {
        if (data.title === helper.POP_UP_TITLES.CoderInfo) {
            if (modalTimeoutPromise) {
                $timeout.cancel(modalTimeoutPromise);
            }
            waitingCoderInfo = false;
            $modal.open({
                templateUrl: 'partials/user.chat.area.coderinfo.html',
                controller: function ($scope, $modalInstance, coderInfo) {
                    $scope.coderInfo = coderInfo;
                    $scope.ok = function () {
                        $modalInstance.close();
                    };
                },
                resolve: {
                    coderInfo: function () {
                        return data.message;
                    }
                }
            });
        } else if (data.title === helper.POP_UP_TITLES.IncorrectUsage) {
            $scope.openModal({
                title: helper.POP_UP_TITLES.IncorrectUsage,
                message: data.message,
                enableClose: true
            });
        }
    });
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
        } else {
            $scope.disableSelect = false;
            $scope.disableInput = false;
        }
    };

    /**
     * Gets the member name for the dropdown at the bottom of the widget.
     *
     * @param {number} memberIdx the index in the dropdown
     * @returns {string} the member name
     */
    $scope.getMemberName = function (memberIdx) {
        if (memberIdx === null) {
            return " ";
        }
        return $scope.whosHereArray[memberIdx].name;
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
        return $scope.getRatingClass($scope.whosHereArray[memberIdx].rating);
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
                ($scope.collapseRegistrant === false ? 1 : 0) +
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
     * Submits the text content according to the chat method selected.
     */
    $scope.chatSubmit = function () {
        if ($scope.chatText === '') {
            return;
        }
        if ($scope.chatText.length > helper.MAX_CHAT_LENGTH) {
            $scope.openModal({
                title: 'Error',
                message: 'You have entered ' + $scope.chatText.length +
                    ' Characters. Please limit your message size to ' + helper.MAX_CHAT_LENGTH + ' characters.',
                enableClose: true
            });
            return;
        }
        if ($scope.methodIdx >= 4) {
            // Reply-To / Whisper chat must have a recipient.
            if ($scope.talkToUser === undefined || $scope.talkToUser === '') {
                $scope.openModal({
                    title: 'Error',
                    message: 'You need to enter who the message is going to',
                    enableClose: true
                });
                $scope.chatText = "";
                return;
            }
        }
        var msg;
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