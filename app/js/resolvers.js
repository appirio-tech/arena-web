///////////////
// RESOLVERS //

var config = require('./config');

//Here we put resolver logic into a container object so that the state declaration code section stays readable
var resolvers = {};
//This function processes the login callback. It is the resolver to the "loggingin" state.
resolvers.finishLogin = ['$rootScope', '$q', '$state', 'cookies', 'sessionHelper', 'socket', function ($rootScope, $q, $state, cookies, sessionHelper, socket) {
    'use strict';
    var deferred, sso = sessionHelper.getTcsso();

    socket.on('StartSyncResponse', function () {
        socket.on('LoginResponse', function (data) {
            if (data.success) {
                $rootScope.isLoggedIn = true;
                if (sessionHelper.getRemember()) {
                    cookies.set(config.ssoKey, sso, -1);
                    sessionHelper.clearRemember();
                }
            } else {
                $rootScope.isLoggedIn = false;
                sessionHelper.removeTcsso();
            }
        });
        socket.on('UserInfoResponse', function (data) {
            sessionHelper.persist({userInfo: data.userInfo});
        });
        socket.on('CreateRoundListResponse', function (data) {
            if (data.type === 2) { // only cares about active contests
                $rootScope.roundData = data.roundData;
            }
        });
        socket.on('RoundScheduleResponse', function (data) {
            if (!$rootScope.roundSchedule) {
                $rootScope.roundSchedule = {};
            }
            $rootScope.roundSchedule[data.roundID] = data.schedule;
        });
        socket.on('KeepAliveInitializationDataResponse', function (data) {
            var timeout = parseInt(data.timeout, 10);
            socket.on('KeepAliveResponse', function () {
                console.log('Keep alive responded.');
            });
            setInterval(function () {
                socket.emit('KeepAliveRequest', {});
            }, timeout);
        });
        socket.on('SynchTimeResponse', function (data) {
            $rootScope.now = data.time;
        });
        socket.on('EndSyncResponse', function () {
            deferred = $q.defer();
            deferred.promise.then(function () {
                $state.go('user.dashboard');
            });
            deferred.resolve();
            return deferred.promise;
        });
    });
    socket.emit('SSOLoginRequest', {sso: sso});
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
    socket.emit('LogoutRequest', {});

    // defer the logout promise
    var deferred = $q.defer();
    deferred.promise.then(function () {
        $state.go('anon.home');
    });
    deferred.resolve();
    return deferred.promise;
}];

module.exports = resolvers;
