'use strict';

var leaderboardUsersCtrl = ['$scope', function ($scope) {
    //query your api for the leaderboard
    //$scope.users = API.Users.query({});
    $scope.users = [
        {id: 1, handle: 'doc', rating: 1800},
        {id: 2, handle: 'merry', rating: 1900},
        {id: 3, handle: 'dopey', rating: 600},
        {id: 4, handle: 'sneezy', rating: 1000}
    ];
}];

module.exports = leaderboardUsersCtrl;