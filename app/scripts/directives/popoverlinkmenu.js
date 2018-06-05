'use strict';

/**
 * @ngdoc directive
 * @name ngramApp.directive:popoverLinkMenu
 * @description
 * # popoverLinkMenu
 */
angular.module('ngramApp')
    .directive('popoverLinkMenu', function ($compile, $sce) {
        return {
            templateUrl: 'ddviews/popoverlinkmenu.html',
            restrict: 'E',
            replace: true,
            scope: {
                tooltipTitleClass: '=?',
                tooltipTitle: '=?',
                linkData: '=?'
            },
            link: function (scope, ele/*, attrs*/) {
                $compile(ele.contents())(scope);
            },
            controller: function ($scope) {
                $scope.tooltipTitle = $scope.tooltipTitle || 'Links';

                $scope.linkData = $scope.linkData || [];
                if (angular.isString($scope.linkData)) {
                    $scope.linkData = JSON.parse($scope.linkData);
                }
                var tpl = '';
                $scope.linkData.forEach(function (d) {
                    tpl += '<li class="list-group-item"> <a target="_blank" href="' + d.url + '">' + d.name + '</a> </li>';
                });
//     $scope.htmlTips = '<ul class="list-group">    <li class="list-group-item"> <a href="#">Name</a> </li>    <li class="list-group-item">Dapibus ac facilisis in</li>    <li class="list-group-item">Morbi leo risus</li>    <li class="list-group-item">Porta ac consectetur ac</li>    <li class="list-group-item">Vestibulum at eros</li>    </ul>';
                $scope.htmlTips = $sce.trustAsHtml('<ul class="list-group">' + tpl + '</ul>');

            }
        };
    });
