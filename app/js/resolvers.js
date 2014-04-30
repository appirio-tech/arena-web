///////////////
// RESOLVERS //

var config = require('./config');

//Here we put resolver logic into a container object so that the state declaration code section stays readable
var resolvers = {};
//This function processes the login callback. It is the resolver to the "loggingin" state.
resolvers.finishLogin = ['$q', '$state', 'cookies', 'sessionHelper', 'socket', function ($q, $state, cookies, sessionHelper, socket) {
    'use strict';
    var deferred, sso = sessionHelper.getTcsso();

    socket.on('LoginResponse', function (data) {
        deferred = $q.defer();
        if (data.success) {
            if (sessionHelper.getRemember()) {
                cookies.set(config.ssoKey, sso, -1);
                sessionHelper.clearRemember();
            }

            deferred.promise.then(function () {
                $state.go('user.dashboard');
            });
        } else {
            deferred.promise.then(function () {
                sessionHelper.removeTcsso();
                $state.go('user.dashboard');
            });
        }
        deferred.resolve();
        return deferred.promise;
    });
    socket.on('UserInfoResponse', function (data) {
        sessionHelper.persist({userInfo: data.userInfo});
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

resolvers.logout = ['$q', '$state', 'sessionHelper', 'socket', function ($q, $state, sessionHelper, socket) {
    'use strict';

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
