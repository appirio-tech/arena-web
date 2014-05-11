///////////////
// RESOLVERS //

var config = require('./config');
var helper = require('./helper');

/**
 * Represents the timeout of establishing socket connection.
 *
 * @type {number}
 */
var connectionTimeout = 25000;

//Here we put resolver logic into a container object so that the state declaration code section stays readable
var resolvers = {};
//This function processes the login callback. It is the resolver to the "loggingin" state.
resolvers.finishLogin = ['$rootScope', '$q', '$state', 'cookies', 'sessionHelper', 'socket', function ($rootScope, $q, $state, cookies, sessionHelper, socket) {
    'use strict';
    var deferred, sso = sessionHelper.getTcsso(), requestId;

    setTimeout(function () {
        if (!$rootScope.connected) {
            $rootScope.isLoggedIn = false;
            sessionHelper.clear();
            sessionHelper.removeTcsso();

            // defer the logout promise
            deferred = $q.defer();
            deferred.promise.then(function () {
                $state.go('anon.home');
            });
            deferred.resolve();
            return deferred.promise;
        }
    }, connectionTimeout);

    // handle the start sync response
    socket.on(helper.EVENT_NAME.StartSyncResponse, function (data) {
        requestId = data.requestId;
    });

    // handle the login response
    socket.on(helper.EVENT_NAME.LoginResponse, function (data) {
        if (data.success) {
            // if success logged in, restore sso to session
            $rootScope.isLoggedIn = true;
            if (sessionHelper.getRemember()) {
                cookies.set(config.ssoKey, sso, -1);
                sessionHelper.clearRemember();
            }
        } else {
            // if fail to log in, remove sso
            $rootScope.isLoggedIn = false;
            sessionHelper.removeTcsso();
        }
    });

    // handle the user info response
    socket.on(helper.EVENT_NAME.UserInfoResponse, function (data) {
        // persist userInfo in session
        sessionHelper.persist({userInfo: data.userInfo});
    });

    // handle the create round list response
    socket.on(helper.EVENT_NAME.CreateRoundListResponse, function (data) {
        if (data.type === 2) { // only cares about active contests
            $rootScope.roundData = data.roundData;
        }
    });

    // handle the round schedule response
    socket.on(helper.EVENT_NAME.RoundScheduleResponse, function (data) {
        // restore values
        if (!$rootScope.roundSchedule) {
            $rootScope.roundSchedule = {};
        }
        $rootScope.roundSchedule[data.roundID] = data.schedule;
    });

    // handle the keep alive initialization data response
    socket.on(helper.EVENT_NAME.KeepAliveInitializationDataResponse, function (data) {
        var timeout = parseInt(data.timeout, 10);
        // handle the keep alive response
        socket.on(helper.EVENT_NAME.KeepAliveResponse, function () {
            console.log('Keep alive responded.');
        });
        // emit keep alive request every timeout interval
        setInterval(function () {
            socket.emit(helper.EVENT_NAME.KeepAliveRequest, {});
        }, timeout);
    });

    // handle the sync time response
    socket.on(helper.EVENT_NAME.SynchTimeResponse, function (data) {
        $rootScope.now = data.time;
    });

    // handle the end sync response
    socket.on(helper.EVENT_NAME.EndSyncResponse, function () {
        // go to dashboard page
        deferred = $q.defer();
        deferred.promise.then(function () {
            $state.go('user.dashboard');
        });
        deferred.resolve();
        return deferred.promise;
    });
    socket.emit(helper.EVENT_NAME.SSOLoginRequest, {sso: sso});
}];

//This function checks if there is already a sso cookie
resolvers.alreadyLoggedIn = ['$q', '$state', 'sessionHelper', function ($q, $state, sessionHelper) {
    'use strict';

    var deferred = $q.defer();
    deferred.promise.then(function () {
        if (sessionHelper.isLoggedIn()) {
            $state.go('loggingin');
        }
    });
    deferred.resolve();
    return deferred.promise;
}];

resolvers.logout = ['$rootScope', '$q', '$state', 'sessionHelper', 'socket', function ($rootScope, $q, $state, sessionHelper, socket) {
    'use strict';

    $rootScope.isLoggedIn = false;
    sessionHelper.clear();
    sessionHelper.removeTcsso();
    socket.emit(helper.EVENT_NAME.LogoutRequest, {});

    // defer the logout promise
    var deferred = $q.defer();
    deferred.promise.then(function () {
        $state.go('anon.home');
    });
    deferred.resolve();
    return deferred.promise;
}];

module.exports = resolvers;
