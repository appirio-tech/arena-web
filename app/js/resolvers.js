///////////////
// RESOLVERS //


//Here we put resolver logic into a container object so that the state declaration code section stays readable
var resolvers = {};
//This function processes the login callback. It is the resolver to the "loggingin" state.
resolvers.finishLogin = ['$state', 'sessionHelper', function ($state, sessionHelper) {
    'use strict';
    var now = new Date();

    /*var errCb = function (err) {
        var stateParams = (err.data && err.data.error) ? err.data.error : {};
        $state.go('error', stateParams);
    }*/

    //clear session
    sessionHelper.clear();

    //process a login callback here. Get a jwt or oauth token and validate against your own user store
    //using an api call. then decide what to do with the user.    
    sessionHelper.persist({
        jwt: 'abc',
        profile: {
            exp: now.valueOf() + 7200000
        },
        userId: '123',
        // HACK: persist username
        username: sessionHelper.username
    });

    $state.go('user.dashboard');
}];

//This function checks if a user already has a session going
resolvers.alreadyLoggedIn = ['$q', '$state', 'sessionHelper', function ($q, $state, sessionHelper) {
    'use strict';

    var deferred = $q.defer();
    deferred.promise.then(function () {
        if (sessionHelper.isLoggedIn()) {
            $state.go('user.dashboard');
        }
    });
    deferred.resolve();
    return deferred.promise;
}];

resolvers.logout = ['$q', '$state', 'sessionHelper', function ($q, $state, sessionHelper) {
    'use strict';

    sessionHelper.clear();

    // defer the logout promise
    var deferred = $q.defer();
    deferred.promise.then(function () {
        $state.go('anon.home');
    });
    deferred.resolve();
    return deferred.promise;
}];

module.exports = resolvers;