# Datadicer

###########################################################################################

## This Datadicer repository has been retired as of 6/11/2021. Datadicer was a relational data visualization library for internal use; this codebase was released as No Support Open Source Software.

###########################################################################################

## 1. Developer Manual

* Clone the repo

      https://github.com/ncbi/datadicer

* Install dependencies 
 
      npm install
      bower install
 
* Serve for live editing:

      grunt serve
    
* Build

      grunt
    
To learn more about the `grunt` command, see the documentation on the 
[Grunt CLI](http://gruntjs.com/using-the-cli). To see a list of all available 
tasks for this project:

    grunt --help    

## 2. User Manual

Add to your angular application

1. The latest and greatest 

        bower install https://github.com/ncbi/datadicer#bower
    
        
3. inject angular module "ngramApp"
        
        angular.module('TestApp', ["ngramApp"]) 

## 3. colModel configuration:
  
    colModel:[{
      name: 'aid',    // name of the field
      label: 'AID',   // display name of the field
      tips: 'tips',   // if you would like to configure a tip for this 
                      // header, please set "tips" property',
      width: 60,      // width of the column
      align: 'right', // text align
      sortable: false
    }]
         
## 4. groupHeaders configuration:
         
    groupHeaders: [{
      useColSpanStyle: true,
      groupHeaders: [
        { startColumnName: 'name', 
          numberOfColumns: 2, 
          titleText: 'L0-info', 
          tip: "another tip"},
        { startColumnName: 'amount', 
          numberOfColumns: 6, 
          titleText: 'L0-Numbers'}
      ]
    }, 
    { useColSpanStyle: true,
      groupHeaders: [
        { startColumnName: 'name', 
          numberOfColumns: 1, 
          titleText: 'L1-name'},
        { startColumnName: 'amount',
          numberOfColumns: 3, 
          titleText: 'L1-Others'}
      ]
    }]


## 5. support HTML in tips

    tips: 'Scientific name <BR> Please search me by using the filed name : <font color="red">scientific_name</font>',  
    


## 6. howto configure a pre-ordered column ( added since version 0.2.10 )

In the grid configuration, add the following :

        sortname: 'strain',
        sortorder: 'asc',

                    
## 7. howto configure filter panel ( advanced)

      advOpts: {
                        open: false, //OPEN BY DEFAULT?
                        downloadBtn: {
                            hidden: false, //HIDE THE DOWNLOAD BUTTON?
                            css: 'btn-default pull-right', //OVERRIDE DOWNLOAD BUTTON CSS?
                            tips:'CSV Download (10k limit)', //default
                            tipsPlacement:'left', //default
                            onClick: function () { //OVERRIDE DEFAULT DOWNLOAD ACTION
                                return _backendDriver.download();
                            }
                        }
       }
       
## 8. howto add top paging bar
              
        toppager:true, //default is no top paging bar
        
## 9. add experimental feature: filter-as-tab
        
          <filter-as-tab filter="filters.taxgroup_name"
                         limit="3"
                         on-filter-change="performSearchDebounced()"></filter-as-tab>
                               
                               
## 10. howto add multiple selections
        
     multiselect: true,
     
## 11. how to enable multiple selection across multiple pages
     
     multiPageSelection: true,

event publisher:


        $scope.$emit('gridtable.allRowsOnPageBeingSelected', $scope.selarrrow, rowids, status);
        $scope.$emit('gridtable.oneRowBeingSelected', $scope.selarrrow, rowid, status);


event subscriber:

        scope.$on('gridtable.reload', data)
        scope.$on('gridtable.resetAllSelection')
        scope.$on('gridtable.selectRow',   data)
        scope.$on('gridtable.reset')

## 12. howto limit the number of facets displayed by default( click `more` to see more)    
        
          facetFields: [{
            label: 'Source',
            name: 'isolation_source',
            allowZeros: false,
            limitByNumber: 6 //default 10 <------------------this line
           }] 
           
## 13. how to expand subgrid by default
           
           subGridExpanded:true

## 14. how to configure a subgrid
                      
           subGridRowExpandedConfigCallback:function(sid, rid, rdata/*row data*/)
           //return a gridConfig
           
Configurations only applicable to subgrid

           title: 'Title: Detail information',
           accessibleTitle: 'I have got enough information about this record, thank you',
           accessibleTitleScreenReaderOnly: false,
           
## 15. how to setup the minimum height
           
            minHeight: 100
            
## 16. add/remove GA tracking
            
simply add/remove the following in app bootstrap function

        'angulartics',
        'angulartics.google.analytics'

As well as GA's code ( no need to explicitly send pageview here please )
        
        <!-- Google Analytics: change UA-XXXXX-X to be your site's ID -->
        
## 17. turn on POST-JSON mode for handling big queries 
        
        mtype:'POST'
        
## 18. how to check datadicer version 
        
        console.info(DataDicer().version)

## 19. add gridtable.columnUpdated event

      $scope.$on('gridtable.columnUpdated', function (e, grid) {
                console.info(grid.getAllColumns());
                console.info(grid.getDisplayColumns());
      });
            
## 20. add pager config

    pagerConfig: {cloneToTop: true},
    
## 21. add no_hits_message that allow user to customize what message to show if there is no hits

    no_hits_message:'no hits!',


  
