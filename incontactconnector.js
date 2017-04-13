(function () {
    'use strict';

    $(document).ready(function () {
        var path = window.location.href;
        if (path.indexOf('access_token') != -1) {
            var accessTokenParam = path.split('access_token=')[1].split('&expires_in')[0];
            Cookies.set('accessToken', decodeURIComponent(accessTokenParam));
        }
        //Cookies.remove('accessToken');

        var accessToken = Cookies.get('accessToken');
        var hasAuth = accessToken && accessToken.length > 0;
        updateUIWithAuthState(hasAuth);
        
        $("#connectButton").click(function() {
            doAuthRedirect();
        });

        $("#submitButton").click(function () {
            
            tableau.connectionName = "InContact";
            tableau.submit();
        });
    });

    function doAuthRedirect() {
        var implicitUri = 'https://api.incontact.com/InContactAuthorizationServer/Authenticate';
        var client_id = 'SW_API@SweatWorks';
        var token_scope = 'RealTimeApi';
        var redirect_uri = 'https://conceptualben.github.io/incontact';
        var state_object = 'myState';
        /*if (tableau.authPurpose === tableau.authPurposeEnum.ephemerel) {
            
        } else if (tableau.authPurpose === tableau.authPurposeEnum.enduring) {
            
        }*/

        var url = implicitUri + '?response_type=token' + '&state=' + state_object + '&client_id=' + encodeURIComponent(client_id) + '&redirect_uri=' + redirect_uri + '&scope=' + encodeURIComponent(token_scope);
        window.location.href = url;
    }

    function isValidDate(dateStr) {
        var d = new Date(dateStr);
        return !isNaN(d.getDate());
    }

    function updateUIWithAuthState(hasAuth) {
        if (hasAuth) {
            $(".notsignedin").css('display', 'none');
            $(".signedin").css('display', 'block');
        } else {
            $(".notsignedin").css('display', 'block');
            $(".signedin").css('display', 'none');
        }
    }

    var myConnector = tableau.makeConnector();

    myConnector.init = function(initCallback) {
        tableau.authType = tableau.authTypeEnum.custom;

        if (tableau.phase == tableau.phaseEnum.authPhase) {
            $(".signedin").css('display', 'none');
        }

        var accessToken = Cookies.get('accessToken');
        console.log("Access token is '" + accessToken + "'");
        var hasAuth = (accessToken && accessToken.length > 0) || tableau.password.length > 0;
        updateUIWithAuthState(hasAuth);

        initCallback();

        if (tableau.phase == tableau.phaseEnum.interactivePhase || tableau.phase == tableau.phaseEnum.authPhase) {
          if (hasAuth) {
              tableau.password = accessToken;

              if (tableau.phase == tableau.phaseEnum.authPhase) {
                // Auto-submit here if we are in the auth phase
                tableau.submit()
              }

              return;
          }
      }
    }

    var InContactAPIBaseEndpoint = 'https://api-c11.incontact.com/inContactAPI/services/v10.0';

    var endpoints = {
        skillsActivity: {
            url: '/skills/activity',
            method: 'GET',
            params: [
                'fields',
                'updatedSince'
            ],
            dataType: 'json',
            incrementColumnId: ''
        },
        cdrPlusDisposition: {
            url: '/report-jobs/datadownload/350047',
            method: 'POST',
            body: {
                saveAsFile: false,
                fileName: 'cdr.csv',
                startDate: null,
                endDate: null
            },
            dataType: 'json',
            incrementColumnId: 'Datetime'
        }
    };

    var skillsActivityTable = {
        id: "skillsActivity",
        alias: "Skills Activity",
        columns: [
            { id: "serverTime", dataType: tableau.dataTypeEnum.string },
            { id: "businessUnitId", dataType: tableau.dataTypeEnum.int },
            { id: "agentsACW", dataType: tableau.dataTypeEnum.int },
            { id: "agentsAvailable", dataType: tableau.dataTypeEnum.int },
            { id: "agentsIdle", dataType: tableau.dataTypeEnum.int },
            { id: "agentsLoggedIn", dataType: tableau.dataTypeEnum.int },
            { id: "agentsUnavailable", dataType: tableau.dataTypeEnum.int },
            { id: "agentsWorking", dataType: tableau.dataTypeEnum.int },
            { id: "campaignId", dataType: tableau.dataTypeEnum.int },
            { id: "campaignName", dataType: tableau.dataTypeEnum.string },
            { id: "contactsActive", dataType: tableau.dataTypeEnum.int },
            { id: "earliestQueueTime", dataType: tableau.dataTypeEnum.string },
            { id: "emailFromAddress", dataType: tableau.dataTypeEnum.string },
            { id: "isActive", dataType: tableau.dataTypeEnum.bool },
            { id: "inSLA", dataType: tableau.dataTypeEnum.int },
            { id: "isNaturalCalling", dataType: tableau.dataTypeEnum.bool },
            { id: "isOutbound", dataType: tableau.dataTypeEnum.bool },
            { id: "mediaTypeId", dataType: tableau.dataTypeEnum.int },
            { id: "mediaTypeName", dataType: tableau.dataTypeEnum.string },
            { id: "outSLA", dataType: tableau.dataTypeEnum.int },
            { id: "queueCount", dataType: tableau.dataTypeEnum.int },
            { id: "serviceLevel", dataType: tableau.dataTypeEnum.int },
            { id: "serviceLevelGoal", dataType: tableau.dataTypeEnum.int },
            { id: "serviceLevelThreshold", dataType: tableau.dataTypeEnum.int },
            { id: "skillName", dataType: tableau.dataTypeEnum.string },
            { id: "skillId", dataType: tableau.dataTypeEnum.int },
            { id: "skillQueueCount", dataType: tableau.dataTypeEnum.int },
            { id: "personalQueueCount", dataType: tableau.dataTypeEnum.int },
            { id: "parkedCount", dataType: tableau.dataTypeEnum.int }
        ]
    };


    var CDRReport = {
        id: "cdrPlusDisposition",
        alias: "CDR Plus Disposition Report",
        columns: [
            { id: "Contact_ID", dataType: tableau.dataTypeEnum.string },
            { id: "Master_Contact_ID", dataType: tableau.dataTypeEnum.string },
            { id: "Point_Of_Contact_Code", dataType: tableau.dataTypeEnum.string },
            { id: "Media_Name", dataType: tableau.dataTypeEnum.string },
            { id: "Point_Of_Contact_Name", dataType: tableau.dataTypeEnum.string },
            { id: "ANI_Dialnum", dataType: tableau.dataTypeEnum.string },
            { id: "Skill_No", dataType: tableau.dataTypeEnum.string },
            { id: "Skill_Name", dataType: tableau.dataTypeEnum.string },
            { id: "Campaign_No", dataType: tableau.dataTypeEnum.string },
            { id: "Campaign_Name", dataType: tableau.dataTypeEnum.string },
            { id: "Agent_No", dataType: tableau.dataTypeEnum.string },
            { id: "Agent_Name", dataType: tableau.dataTypeEnum.bool },
            { id: "Team_No", dataType: tableau.dataTypeEnum.string },
            { id: "Team_Name", dataType: tableau.dataTypeEnum.string },
            { id: "SLA", dataType: tableau.dataTypeEnum.string },
            { id: "Start_Date", dataType: tableau.dataTypeEnum.date },
            { id: "start_time", dataType: tableau.dataTypeEnum.datetime },
            { id: "Datetime", dataType: tableau.dataTypeEnum.datetime },
            { id: "Prequeue", dataType: tableau.dataTypeEnum.int },
            { id: "Inqueue", dataType: tableau.dataTypeEnum.int },
            { id: "Agent_Time", dataType: tableau.dataTypeEnum.int },
            { id: "Postqueue", dataType: tableau.dataTypeEnum.int },
            { id: "ACW_Time", dataType: tableau.dataTypeEnum.int },
            { id: "Total_Time_Plus_Disposition", dataType: tableau.dataTypeEnum.int },
            { id: "Abandon_Time", dataType: tableau.dataTypeEnum.int },
            { id: "Routing_Time", dataType: tableau.dataTypeEnum.int },
            { id: "Abandon", dataType: tableau.dataTypeEnum.bool },
            { id: "Callback_Time", dataType: tableau.dataTypeEnum.int },
            { id: "Logged", dataType: tableau.dataTypeEnum.bool },
            { id: "Hold_Time", dataType: tableau.dataTypeEnum.int },
            { id: "Disposition_Code", dataType: tableau.dataTypeEnum.string },
            { id: "Disposition_Name", dataType: tableau.dataTypeEnum.string },
            { id: "Tags", dataType: tableau.dataTypeEnum.string }
        ],
        incrementColumnId: 'Datetime'
    };

    var CDRColumns = [
        "Contact_ID",
        "Master_Contact_ID",
        "Point_Of_Contact_Code",
        "Media_Name",
        "Point_Of_Contact_Name",
        "ANI_Dialnum",
        "Skill_No",
        "Skill_Name",
        "Campaign_No",
        "Campaign_Name",
        "Agent_No",
        "Agent_Name", 
        "Team_No",
        "Team_Name",
        "SLA",
        "Start_Date", 
        "start_time",
        "Prequeue",
        "Inqueue",
        "Agent_Time",
        "Postqueue",
        "ACW_Time",
        "Total_Time_Plus_Disposition",
        "Abandon_Time",
        "Routing_Time",
        "Abandon",
        "Callback_Time",
        "Logged",
        "Hold_Time",
        "Disposition_Code",
        "Disposition_Name",
        "Tags",
    ];

    myConnector.getSchema = function (schemaCallback) {
        schemaCallback([skillsActivityTable, CDRReport]);
    };

    function parseCSV(csv, hasHeader, headersParam) {
        var csvLines = csv.split('\n');
        var headers, j;
        if(hasHeader) {
            j = 1;
            headers = csvLines[0].split(',');
        }
        else {
            j = 0
            headers = headersParam;
        }
        var result = [];
        
        for(var i = j; i < csvLines.length; i++) {
            var obj = {};
            var currentline = csvLines[i].split(',');
            for(var j = 0; j < headers.length; j++) {
                obj[headers[j]] = currentline[j];
            }
            result.push(obj);
        }

        return result;
    }

    myConnector.getData = function (table, doneCallback) {
        var endpoint = endpoints[table.tableInfo.id];

        var startDateParam;
        if(table.incrementValue) startDateParam = new Date(table.incrementValue);
        else startDateParam = new Date('2016-09-01');
        var endDateParam = new Date(startDateParam);
        endDateParam.setDate(endDateParam.getDate() + 30);
        console.log('table.incrementValue: '+table.incrementValue);

        var bodyObj = {
            "saveAsFile": false,
            "fileName": "cdr.csv",
            "startDate": startDateParam.toISOString().split('.')[0]+"Z",
            "endDate": endDateParam.toISOString().split('.')[0]+"Z"
        };

        $.ajax({
            url: InContactAPIBaseEndpoint + endpoint.url,
            type: endpoint.method,
            dataType: endpoint.dataType,
            headers: {
                'Authorization': 'bearer ' + tableau.password
            },
            data: bodyObj,
            success: function(response, status, jqxhr) { 
                var tableData = [];
                var respJSON;
                var lastId = table.incrementValue;
                console.log('lastId: '+lastId);
                
                var encodedCSV = response['file'];
                var decodedCSV = atob(encodedCSV);
                respJSON = parseCSV(decodedCSV, false, CDRColumns);

                for (var i = 0; i < respJSON.length - 1; i++) {
                    var startDate = respJSON[i]['Start_Date'], startTime = respJSON[i]['start_time'], dateVector, timeVector;
                    if(startDate) dateVector = startDate.split('/');
                    if(startTime) timeVector = startTime.split(':');
                    respJSON[i]['Datetime'] = dateVector[2] + '-' +  dateVector[0] + '-' + dateVector[1] + 'T' + startTime + 'Z';
                    var incrementColumnValue = respJSON[i][endpoint.incrementColumnId];
                    
                    if(/*!incrementColumnValue || */lastId >= incrementColumnValue) continue;
                    tableData.push(respJSON[i]);
                }

                table.appendRows(tableData);
                doneCallback();
            },
            error: function(response) { 
                console.log('Error: ' + JSON.stringify(response));
                console.log('Error: '+ this.body);
                
                tableau.abortWithError(JSON.stringify(response));
            }
            
        });
    };

    tableau.registerConnector(myConnector);

})();