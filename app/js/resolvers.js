///////////////
// RESOLVERS //

var config = require('./config');

//Here we put resolver logic into a container object so that the state declaration code section stays readable
var resolvers = {};
//This function processes the login callback. It is the resolver to the "loggingin" state.
resolvers.finishLogin = ['$q', '$state', '$document', 'sessionHelper', 'socket', function ($q, $state, $document, sessionHelper, socket) {
    'use strict';
    var date, deferred, sso = sessionHelper.getTcsso();

    socket.on('login', function (data) {

        if (sessionHelper.getRemember()) {
            date = new Date();
            date.setFullYear(date.getFullYear() + 100);
            // set the cookie expiry
            $document[0].cookie = config.ssoKey + '=' + sso +
                '; Expires=' + date.toUTCString() + '; Domain=topcoder.com; Path=/';
        }
        sessionHelper.clear();
        sessionHelper.persist({username: data.username});

        deferred = $q.defer();
        deferred.promise.then(function () {
            $state.go('user.dashboard');
        });
        deferred.resolve();
        return deferred.promise;
    });
    socket.on('loginFailed', function () {
        deferred = $q.defer();
        deferred.promise.then(function () {
            sessionHelper.removeTcsso();
            $state.go('user.dashboard');
        });
        deferred.resolve();
        return deferred.promise;
    });
    socket.emit('ssoLogin', {sso: sso});
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
    socket.emit('logout', {});

    // defer the logout promise
    var deferred = $q.defer();
    deferred.promise.then(function () {
        $state.go('anon.home');
    });
    deferred.resolve();
    return deferred.promise;
}];

module.exports = resolvers;
