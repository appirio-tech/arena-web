/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This file provides the chat area controller.
 *
 * Changes in version 1.1 (Module Assembly - Web Arena UI Fix):
 * - Many simple changed (syntax) to clean the file and pass jslint.
 * - Changed userProfile.username to userProfile.handle to display correct information
 * - Added $rootScope to the list of parameters
 *
 * @author dexy
 * @version 1.1
 */
'use strict';
//global chat area, module

/**
 * The chat area controller.
 *
 * @type {*[]}
 */
var chatAreaCtrl = ['$scope', '$rootScope', '$timeout', '$modal', function ($scope, $rootScope, $timeout, $modal) {
    /*jslint unparam: true*/
    var rebuildAllScrollbar = function () {
            $scope.$broadcast('rebuild:methods');
            $scope.$broadcast('rebuild:members');
            if (!$scope.collapseMemberHere) {
                $scope.$broadcast('rebuild:whosHere');
            } else {
                $scope.$broadcast('rebuild:registrants');
            }
        },
        openAlertModal = function () {
            $modal.open({
                templateUrl: 'partials/user.chat.area.alert.html',
                controller: function ($scope, $modalInstance) {
                    $scope.ok = function () {
                        $modalInstance.close();
                    };
                }
            });
        };
    /*jslint unparam: false*/

    $scope.showRatingKey = true;
    $scope.showRegistrant = false;
    $scope.showMemberHere = true;

/*
    $http.get('data/profile-' + $rootScope.username() + '.json').success(function (data) {
        $scope.userProfile = data;
        $scope.whosHereArray.push({
            name: $scope.userProfile.username,
            rating: $scope.userProfile.rating
        });
    });
*/
    $scope.userProfile = $rootScope.userInfo();



    function systemNotification() {
        // in current arena implementation, system will give a
        // message after a user step in lobby
        $timeout(function () {
            $scope.chatContent.push({
                text: "System> " + $scope.userProfile.handle + " has entered the room.",
                type: "system"
            });
        }, 500);

        $timeout(function () {
            $scope.chatContent.push({
                text: "System>" + $scope.whosHereArray[3].name + " has left the room.",
                type: "system"
            });
            $scope.whosHereArray.splice(3, 1);
        }, 2000);

        $timeout(function () {
            $scope.whosHereArray.push({name: "Iron man", rating: 2499});
            $scope.chatContent.push({
                text: "System>" + $scope.whosHereArray[$scope.whosHereArray.length - 1].name + " has entered the room.",
                type: "system"
            });
        }, 3000);

        $timeout(function () {
            $scope.chatText = "Username 6> " + $scope.userProfile.handle + ": Hi, I have some questions..." + " ";
            $scope.chatContent.push({
                text: $scope.chatText,
                type: "general toMe"
            });
            $scope.chatText = "";
            $scope.$broadcast('rebuild:chatboard');

            // when all this done rebuild the scroll bar
            rebuildAllScrollbar();
        }, 4000);
    }

    systemNotification.call();

    //initialize showRegistrant by directive's attribute, default to false, not to show the registrants section
    this.init = function (registrantsConfig) {
        if (registrantsConfig !== undefined && registrantsConfig === "true") {
            $scope.showRegistrant = true;
        }
    };

    // lobby dropdown
    $scope.lobbyIdx = 0;
    $scope.lobbiesArray = [
        "Lobby1",
        "Lobby2",
        "Lobby3",
        "Lobby4",
        "Lobby5"
    ];
    $scope.getLobbyName = function (lobbyIdx) {
        return $scope.lobbiesArray[lobbyIdx];
    };
    $scope.setLobby = function (index) {
        systemNotification.call();
        $scope.whosHereArray.splice($scope.whosHereArray.length - 1, 1);
        $scope.chatContent = [];
        $scope.lobbyIdx = index;
        // reset the chatboard and whos here and registrant area.
        $scope.$broadcast('rebuild:chatboard');
        rebuildAllScrollbar();
    };

    // this function return the css class of rating value
    $scope.getRatingClass = function (rating) {
        if (rating >= 2200) {
            return "rating-red";
        }
        if (rating >= 1500) {
            return "rating-yellow";
        }
        if (rating >= 1200) {
            return "rating-purple";
        }
        if (rating >= 900) {
            return "rating-green";
        }
        if (rating >= 1) {
            return "rating-grey";
        }
        if (rating === 0) {
            return "rating-none";
        }
        if (rating === -1) {
            return "rating-admin";
        }
        return "";
    };

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
    $scope.collapseRatingKey = false;

    // array of who's Here
    $scope.whosHereArray = [
        {name: "Username1", rating: 2200},
        {name: "Username2", rating: 2400},
        {name: "Username3", rating: 1500},
        {name: "Username4", rating: 2199},
        {name: "Username5", rating: 1200},
        {name: "Username6", rating: 1499},
        {name: "Username7", rating: 900},
        {name: "Username8", rating: 1199},
        {name: "Username9", rating: 1},
        {name: "Username10", rating: 899},
        {name: "Username11", rating: 0},
        {name: "Username12", rating: -1} //this is admin
    ];

    $scope.showCoderInfo = function (index) {
        var coderInfo = {
                username: $scope.whosHereArray[index].name,
                rating: $scope.whosHereArray[index].rating,
                rated: 1,
                since: "Otc 25, 2013",
                country: "China",
                coderType: "Student",
                school: "Hogwarts School of Witchcraft and Wizardry",
                quote: "Member of ...."
            };
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
                    return coderInfo;
                }
            }
        });
    };

    $scope.collapseMemberHere = true;
    $scope.collapseRegistrant = true;

    $scope.getMethodName = function (methodIdx) {
        return $scope.methodsArray[methodIdx];
    };
    $scope.disableSelect = true;
    $scope.setChatMethod = function (index) {
        $scope.methodIdx = index;
        //if user choose "Admins", "General", "Me",
        // there is no need to specify a user to talk to
        // in current arena implementation. so set memberIdx to null
        if (index < 3) {
            $scope.memberIdx = null;
            $scope.disableSelect = true;
        } else {
            $scope.disableSelect = false;
        }
    };
    $scope.methodIdx = 1;
    $scope.methodsArray = [
        "Admins",
        "General",
        "Me",
        "Question",
        "Reply to",
        "Whisper"
    ];

    $scope.memberIdx = null;
    $scope.getMemberName = function (memberIdx) {
        if (memberIdx === null) {
            return " ";
        }
        return $scope.whosHereArray[memberIdx].name;
    };
    $scope.getMemberRatingClass = function (memberIdx) {
        if (memberIdx === null) {
            return "";
        }
        return $scope.getRatingClass($scope.whosHereArray[memberIdx].rating);
    };
    $scope.talkTo = function (index) {
        $scope.memberIdx = index;
    };


    // this function rebuild the multi ng-scrollbars in this widget.
    $scope.rebuildScrollbar = function (bar) {
        //the left aside have a fixed height, so we need to customize the height of each
        // ng-scrollbar which belong to registrants, who's here and rating key section.
        //
        // the height is calculate by the height of left aside, header of each section and
        // height of the rating key ul
        if ($scope.collapseRatingKey) {
            if ($scope.showRegistrant) {
                $scope.whosHereScrollHeight = "scroll-height-1"; // 351-3*41
                $scope.registrantsScrollHeight = "scroll-height-1";
            } else {
                $scope.whosHereScrollHeight = "scroll-height-2"; //351-2*41
            }
        } else {
            if ($scope.showRegistrant) {
                $scope.whosHereScrollHeight = "scroll-height-3"; // 351-186-41*2
                $scope.registrantsScrollHeight = "scroll-height-3";
            } else {
                $scope.whosHereScrollHeight = "scroll-height-4"; //351-184-41
            }
        }
        // this function is reusable, can rebuild a specify ng-scrollbar according to
        // "bar" param
        if (bar === "methods") {
            $scope.$broadcast('rebuild:methods');
        } else if (bar === "members") {
            $scope.$broadcast('rebuild:members');
        } else if (bar === "registrants") {
            $scope.$broadcast('rebuild:registrants');
        } else if (bar === 'whoshere') {
            $scope.$broadcast('rebuild:whosHere');
        } else {
            if (!$scope.collapseMemberHere) {
                $scope.$broadcast('rebuild:whosHere');
            } else {
                $scope.$broadcast('rebuild:registrants');
            }
        }
    };


    // this is the array of the chat texts in the chat area
    $scope.chatContent = [];
    $scope.chatText = "";

    // this function adjust the chatText content and style according to chat method.
    // current arena implementation have three text style:
    // system style: green color
    // general style: white color
    // secret style: italic and grey
    $scope.chatSubmit = function () {
        if ($scope.chatText === "") {
            return;
        }
        var type = "general";
        switch ($scope.methodIdx) {
        case 0:
            $scope.chatText = $scope.userProfile.handle + "> admins: " + $scope.chatText;
            break;
        case 1:
            $scope.chatText = $scope.userProfile.username + "> " + $scope.chatText;
            break;
        case 2:
            $scope.chatText = "**" + $scope.userProfile.username + " " + $scope.chatText + " ";
            type = "secret";
            break;
        case 3:
            if ($scope.memberIdx === null) {
                openAlertModal();
                $scope.chatText = "";
                return;
            }
            $scope.chatText = $scope.userProfile.username + "> " + $scope.whosHereArray[$scope.memberIdx].name + ": " + $scope.chatText + " ";
            if ($scope.whosHereArray[$scope.memberIdx].name === $scope.userProfile.username) {
                type += " toMe";
            }
            break;
        case 4:
            if ($scope.memberIdx === null) {
                openAlertModal();
                $scope.chatText = "";
                return;
            }
            $scope.chatText = $scope.userProfile.username + "> " + $scope.whosHereArray[$scope.memberIdx].name + ": " + $scope.chatText + " ";
            if ($scope.whosHereArray[$scope.memberIdx].name === $scope.userProfile.username) {
                type += " toMe";
            }
            break;
        case 5:
            if ($scope.memberIdx === null) {
                openAlertModal();
                $scope.chatText = "";
                return;
            }
            type = "secret";
            if ($scope.whosHereArray[$scope.memberIdx].name === $scope.userProfile.username) {
                $scope.chatText = $scope.userProfile.username + " whisper to " + "you: " + $scope.chatText;
                type += " toMe";
                break;
            }
            $scope.chatText = "You whisper to " + $scope.whosHereArray[$scope.memberIdx].name + ": " + $scope.chatText;
            break;
        default:
        }
        $scope.chatContent.push({
            text: $scope.chatText,
            type: type
        });
        $scope.chatText = "";
        // after user submit the text, rebuild the ng-scrollbar of chat area
        $scope.$broadcast('rebuild:chatboard');
    };

    $scope.findMode = false;
    $scope.findText = "";
    $scope.matchCheck = false;
    $scope.highlightCheck = true;

}];

module.exports = chatAreaCtrl;