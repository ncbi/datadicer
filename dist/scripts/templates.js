angular.module('ngramApp').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('ddviews/advanced-options-selected-button.html',
    "<div class=\"btn btn-sm\" style=\"margin-right: 8px\" ng-show=!advOpts.selectsBtn.hidden ng-class=\"advOpts.selectsBtn.css || 'btn-default pull-right'\"><span tooltip-placement=\"{{advOpts.selectsBtn.tipsPlacement || 'left'}}\" uib-tooltip=\"{{advOpts.selectsBtn.tips || 'Selected Records'}}\" tooltip-popup-delay=500 tooltip-append-to-body=true analytics-on analytics-category=download analytics-event=\"download button\" analytics-label=download ng-click=advOpts.selectsBtn.onClick()><i class=\"fa fa-list-ol\" aria-hidden=true></i> <span>Selected : </span></span><span ng-show=\"selarrrow.length>0\"><span class=\"badge filteron count\">{{selarrrow.length}}</span><span class=\"badge filteron reset\" analytics-on analytics-category=Options analytics-event=\"reset selection button(x)\" analytics-label=clicked ng-show=\"selarrrow.length>0\" uib-popover=Reset popover-trigger=mouseenter ng-click=resetAllSelection()><i class=\"fa fa-times\"></i></span></span></div>"
  );


  $templateCache.put('ddviews/advanced-options.html',
    "<div class=ngram><div class=advancedoptions><div ng-show=\" !panel.open\"><span aria-role=button class=\"filters-open btn btn-default pull-left btn-sm\" style=\"margin-right: 8px\" analytics-on analytics-category=Options analytics-event=\"option button\" analytics-label=expanded ng-click=\" panel.open = !panel.open\"><i ng-class=\"{'fa fa-cog':filters.filtersCount(),'glyphicon glyphicon-chevron-down':!filters.filtersCount()}\"></i> <span>Filters</span> <span ng-show=filters.filtersCount() class=\"badge filteron\" uib-popover=\"{{filters.filtersCount()}} filter{{filters.filtersCount()>1?'s':''}} applied, click to view\" popover-trigger=mouseenter>{{filters.filtersCount()}}</span></span><ng-transclude></ng-transclude><div advanced-options-selected-button ng-show=\"config.multiselect && selarrrow.length>0\" adv-opts=config.advOpts selarrrow=selarrrow reset-all-selection=resetAllSelection()></div><button class=\"btn btn-sm\" ng-show=!config.advOpts.downloadBtn.hidden ng-class=\"config.advOpts.downloadBtn.css || 'btn-default pull-right'\" tooltip-placement=\"{{config.advOpts.downloadBtn.tipsPlacement || 'left'}}\" uib-tooltip=\"{{config.advOpts.downloadBtn.tips || 'CSV Download (10k limit)'}}\" tooltip-popup-delay=500 tooltip-append-to-body=true analytics-on analytics-category=download analytics-event=\"download button\" analytics-label=download ng-click=config.advOpts.downloadBtn.onClick()><i class=\"fa fa-download\" aria-hidden=true></i> Download</button></div><uib-tabset ng-show=panel.open class=animate-show-tab><uib-tab active=true class=pull-left style=\"margin-left: 4px\"><uib-tab-heading analytics-on analytics-category=Options analytics-event=\"option button\" analytics-label=collapsed><span aria-role=button class=filters-close ng-click=\"panel.open = false\"><i class=\"glyphicon glyphicon-chevron-up\"></i> Filters </span><span class=\"badge filteron count\" ng-show=filters.filtersCount() uib-popover=\"{{filters.filtersCount()}} filter{{filters.filtersCount()>1?'s':''}} applied\" popover-trigger=mouseenter>{{filters.filtersCount()}} </span><span class=\"badge filteron reset\" analytics-on analytics-category=Options analytics-event=\"reset filter button(x)\" analytics-label=clicked ng-show=filters.filtersCount() uib-popover=Reset aria-label=\"Reset filters\" popover-trigger=mouseenter ng-click=\"filters.resetAllFilters({doSearch: true})\"><i class=\"fa fa-times\"></i></span></uib-tab-heading><div class=row><div ng-repeat=\"n in (config.filtersFields || config.facetFields ) track by $index\" class=\"col-xs-12 col-md-12\" ng-show=!n.hidden><fieldset class=\"input-group input-group-sm\"><legend class=input-group-addon><span class=\"glyphicon glyphicon-filter-\"></span> {{n.label || n.displayname}}</legend><div ng-if=!n.rowChart checkbox-inline filters=filters[n.name] allow-zeros=n.allowZeros limit-by-number=n.limitByNumber on-filter-changes=onFilterChange() class=filter style=\"border-right:none;border-bottom: none;border-top: none\"></div><div ng-if=n.rowChart rowchart config=n filters=filters[n.name] allow-zeros=n.allowZeros limit-by-number=n.limitByNumber on-filter-changes=onFilterChange() class=filter style=\"order-right:none;border-bottom: none;border-top: none\"></div></fieldset></div><div ng-repeat=\"n in (config.rangeFacetFields ) track by $index\" class=\"col-xs-12 col-md-12\" ng-show=!n.hidden><fieldset class=\"input-group input-group-sm\"><legend class=input-group-addon style=\"border-right: 1px solid #ccc\"><span class=\"glyphicon glyphicon-filter-\"></span>{{n.name}}</legend><div barchart config=n filters=filters[n.field] range-filters=rangeFilters[n.field] on-filter-changes=onFilterChange() class=filter style=\"border-right:none;border-bottom: none;border-top: none\"></div></fieldset></div><div ng-repeat=\"n in (config.stringFilterFields ) track by $index\" class=\"col-xs-12 col-md-12\" ng-show=!n.hidden><fieldset class=\"input-group input-group-sm\"><legend class=input-group-addon style=\"border-right: 1px solid #ccc\">{{n.label}}</legend><div dd-autosuggest-input config=n filters=filters[n.name] get-suggestions=n.getSuggestions(value) class=filter on-filter-changes=onFilterChange()></div></fieldset></div></div></uib-tab></uib-tabset><div class=row><div ng-show=panel.open class=\"col-xs-12 col-md-12\"><ng-transclude></ng-transclude><button ng-show=!config.advOpts.downloadBtn.hidden ng-class=\"config.advOpts.downloadBtn.css || 'btn-default pull-right'\" class=\"btn btn-sm\" tooltip-placement=\"{{config.advOpts.downloadBtn.tipsPlacement || 'left'}}\" tooltip-popup-delay=500 uib-tooltip=\"{{config.advOpts.downloadBtn.tips || 'CSV Download (10k limit)'}}\" tooltip-append-to-body=true analytics-on analytics-category=download analytics-event=\"download button\" analytics-label=download ng-click=config.advOpts.downloadBtn.onClick()><i class=\"fa fa-download\" aria-hidden=true></i> Download</button></div></div></div></div>"
  );


  $templateCache.put('ddviews/barchart.html',
    "<div class=ngram><div id={{::config.field}}-chart class=barchart><p style=\"font-size: 11px\">{{config.unit}} <span class=filter></span> <a class=reset ng-click=resetChart() style=\"display: none\">reset</a></p><div style=\"clear: both\"></div></div></div>"
  );


  $templateCache.put('ddviews/checkboxInline.html',
    "<span ng-repeat=\"filter in filters | sortAndFilterTags:limitFilters | filter:zerosFilter as filtered \" class=\"checkbox-inline no_indent checkboxinline\" analytics-on analytics-category=Options analytics-event=\"filters click\" analytics-label={{filter.name}} role=checkbox aria-hidden=false ng-checked=filter.selected ng-show=\"expand || $index < limit\" ng-click=\"filter.selected = !filter.selected;onFilterChanges()\"><i class=item_checkbox ng-class=\"filter.selected? ' fa fa-check-square-o ' : 'fa fa-square-o '\"></i> <span class=\"item_name item_name_{{filter.name | slugify }}\">{{filter.name}}</span><span class=item_count>({{(filter.count | number )}})</span> </span><span class=\"checkboxinline no_indent checkboxinline\" ng-show=\"filtered.length > limit \"><span analytics-on analytics-category=Options analytics-event=\"filters more_or_less\" analytics-label=more ng-click=\"expand=true\" ng-show=!expand class=item_name><i class=\"item_checkbox fa fa-plus-square-o\" aria-hidden=true></i> more </span><span analytics-on analytics-category=Options analytics-event=\"filters more_or_less\" analytics-label=less ng-click=\"expand=false\" ng-show=expand class=item_name><i class=\"item_checkbox fa fa-minus-square-o\" aria-hidden=true></i> less</span></span>"
  );


  $templateCache.put('ddviews/dd-autosuggest-input.html',
    "<span class=dd-autosuggest-input ng-class=\"{'has-error': myForm._term.length>0 && myForm._term.length<config.minimum , 'has-success': myForm._term.length>=config.minimum}\"><input ng-model=myForm._term name={{config.name}} placeholder={{config.placeholder}} uib-tooltip=\"minimum {{config.minimum}} characters required\" tooltip-append-to-body=true tooltip-enable=false aria-label={{config.placeholder}} analytics-on analytics-category=Options analytics-event={{config.name}} analytics-label=updated uib-typeahead=\"name for name in getSuggestedName($viewValue)\" typeahead-loading=_loadingTerms typeahead-min-length=1 typeahead-editable=true typeahead-on-select=\"filters = myForm._term\" ng-blur=\"filters  = myForm._term\" ng-keyup=\"$event.keyCode == 13 && (filters = myForm._term)\" class=form-control> <span ng-show=_loadingTerms class=\"glyphicon glyphicon-refresh form-control-feedback glyphicon-spin\" style=\"right: 18px\"></span> <span ng-show=\"myForm._term \" class=\"glyphicon glyphicon-remove form-control-feedback clean-btn\" ng-click=\"filters='';myForm._term='';onFilterChanges()\" aria-label=Clear></span> <span ng-show=\"myForm._term.length>0 && myForm._term.length < config.minimum\" class=\"has-error form-control-feedback-msg-inline\" style=\"padding-left:170px; text-align: right\">minimum {{config.minimum}} characters required</span></span>"
  );


  $templateCache.put('ddviews/filter-as-tab.html',
    "<uib-tabset active=active style=\"padding-top: 20px\"><uib-tab index=$index ng-repeat=\"tab in filter | limitTo:mylimit \" heading=\"{{tab.name}} ({{tab.count}}) \" analytics-on analytics-category=\"filters as tab\" analytics-event=\"tab click\" analytics-label={{tab}} select=tabChange(tab)></uib-tab></uib-tabset>"
  );


  $templateCache.put('ddviews/gridTable.html',
    "<div aria-live=polite style=\"margin-top: 10px\" tabindex=0><div class=\"alert alert-danger\" role=alert ng-show=gridtable_show_error_message><span ng-show=!grid_search_backend_error>No hits found.</span> <span ng-show=grid_search_backend_error>{{grid_search_backend_error.msg || 'Service Not Available.'}}</span> <button type=button class=close data-dismiss=alert aria-label=Close ng-click=\"gridtable_show_error_message=!gridtable_show_error_message\"><span aria-hidden=true>&times;</span></button><br></div><div ng-show=!gridtable_show_error_message><table class=TableGrid id=grid{{::uniqueId}}></table><div class=TablePager id=pager{{::uniqueId}}></div></div></div>"
  );


  $templateCache.put('ddviews/popoverlinkmenu.html',
    "<span ng-show=\"linkData.length>0\"><a href={{linkData[0].url}} target=_blank ng-show=\"linkData.length<2\" ng-class=tooltipTitleClass>{{linkData[0].name}} </a><a href ng-show=\"linkData.length>=2\" ng-class=tooltipTitleClass uib-tooltip-html=htmlTips tooltip-placement=bottom tooltip-append-to-body=true tooltip-trigger=focus>{{tooltipTitle}}</a></span>"
  );


  $templateCache.put('ddviews/rowchart.html',
    "<div class=ngram><div id={{::config.field}}-chart class=rowchart><p style=\"font-size: 11px\">{{config.unit}} <span class=filter></span> <a class=reset ng-click=resetChart() style=\"display: none\">reset</a></p><div style=\"clear: both\"></div></div></div>"
  );


  $templateCache.put('ddviews/searchbar.html',
    "<div class=ngram><div class=dd-searchbar ng-class=\"{'has-error': query.matching && !hasValidInput() , 'has-success': query.matching && hasValidInput()}\"><span class=input-group><input aria-label=searchbox class=form-control ng-model=query.matching placeholder={{::placeholder}} uib-tooltip={{::placeholder}} tooltip-append-to-body=true tooltip-enable=false aria-label={{::placeholder}} analytics-on analytics-category=Options analytics-event=searchbox analytics-label=searchbox ng-keyup=\"($event.keyCode == 13 || query.matching=='')  && onSearch()\"> <span ng-show=query.matching class=\"glyphicon glyphicon-remove form-control-feedback clean-btn\" aria-label=\"start over the search\" ng-click=onStartOver()></span> <span class=input-group-btn><span class=\"btn btn-primary\" analytics-on analytics-event=Search analytics-category=Commands analytics-label=\"Search Button\" ng-disabled=!hasValidInput() style=border-bottom-left-radius:0;border-top-left-radius:0 ng-click=onSearch() disabled><i class=\"fa fa-search\"></i> Search</span></span></span></div></div>"
  );


  $templateCache.put('ddviews/searchbox.html',
    "<div><div class=\"col-sm-12 col-md-12\" ng-class=\"{'has-error': query.matching && !hasValidInput() , 'has-success': query.matching && hasValidInput()}\"><textarea role=textbox aria-multiline=true aria-label=searchbox ng-model=query.matching class=form-control style=\"max-height: 100px\" placeholder=\"what are you looking for ...\"></textarea><p class=\"help-block error\" ng-show=\"query.matching && !hasValidInput(6)\">Please input a protein gi or sequence (raw/plain text format) to start...</p></div><div class=\"col-sm-12 col-md-12\"><div style=\"margin-top: 1em\"><div><button class=\"btn btn-primary btn-sm\" analytics-on analytics-event=Search analytics-category=Commands analytics-label=\"Search Button\" ng-disabled=!hasValidInput() ng-click=onSearch() disabled><i class=\"fa fa-search\"></i> Search</button> <button class=\"btn btn-default btn-sm\" analytics-on analytics-event=\"Start Over\" analytics-category=Commands analytics-label=\"Start Over Button\" ng-disabled=\"!hasValidInput() && !filters.filtersCount()\" ng-show=\"query.matching || filters.filtersCount()\" ng-click=onStartOver()><i class=\"fa fa-undo\"></i> Start Over</button></div></div></div></div>"
  );


  $templateCache.put('ddviews/subgrid-modal.html',
    "<div class=modal-header><h3 class=modal-title id=modal-title>{{config.title}}</h3></div><div class=modal-body id=modal-body><grid-table query=query filters=filters config=config></grid-table></div><div class=modal-footer><button class=\"btn btn-primary\" type=button ng-click=ok()>OK</button></div>"
  );


  $templateCache.put('ddviews/view.html',
    "<div class=container style=\"margin-top: 50px\"><div class=container><h1>DataDicer Library</h1><div class=row><div searchbox query=query filters=filters on-search=performSearchDebounced() on-start-over=startOver()></div></div><div class=row><div class=\"col-sm-12 col-md-12\"><div ui-view></div></div></div></div><br><br><div class=pull></div></div>"
  );


  $templateCache.put('ddviews/view.table.html',
    "<advanced-options config=gridConfig query=query filters=filters range-filters=rangeFilters on-filter-change=performSearchDebounced()></advanced-options><grid-table config=gridConfig query=query filters=filters range-filters=rangeFilters></grid-table>"
  );

}]);
