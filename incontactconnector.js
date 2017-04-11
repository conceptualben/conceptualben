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
            var dateObj = {
                startDate: $('#start-date-one').val().trim(),
                endDate: $('#end-date-one').val().trim(),
            };

            if (isValidDate(dateObj.startDate) && isValidDate(dateObj.endDate)) {
                tableau.connectionData = JSON.stringify(dateObj);
                tableau.connectionName = "InContact";
                tableau.submit();
            } else {
                $('#errorMsg').html("Enter valid dates. For example, 2016-05-08.");
            }
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
            method: 'GET',
            params: [
                'saveAsFile',
                'fileName',
                'startDate',
                'endDate'
            ],
            dataType: 'csv',
            incrementColumnId: 'Start_Date'
        }
    };

    myConnector.getSchema = function (schemaCallback) {
        
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
                { id: "Start_Time", dataType: tableau.dataTypeEnum.datetime },
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
            incrementColumnId: 'Start_Date'
        };

        schemaCallback([skillsActivityTable, CDRReport]);
    };

    function parseCSV(csv) {
        var csvLines = csv.split('\n');
        var headers = csvLines[0].split(',');
        var result = [];
        

        for(var i = 1; i < csvLines.length; i++) {
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
        var dateObj = JSON.parse(tableau.connectionData),
            dateString = "updatedSince=" + dateObj.startDate + "&endtime=" + dateObj.endDate,
            endpoint = {};//InContactAPIBaseEndpoint + "skills/activity?" + dateString;

        endpoint = endpoints[table.tableInfo.id];

        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/today.csv', true);
        xhr.onload = function (e) {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              var tableData = [];
                var respJSON;
                var lastId = new Date(table.incrementValue);
                console.log('lastId: '+lastId);
                
                if(endpoint.dataType == 'csv') {
                    respJSON = parseCSV(xhr.responseText);
                }
                
                for (var i = 0, len = respJSON.length; i < len; i++) {
                    console.log('incrementColumnValue: '+incrementColumnValue);
                    var incrementColumnValue = new Date(respJSON[i][endpoint.incrementColumnId]);
                    if(!incrementColumnValue || lastId >= incrementColumnValue) continue;
                    tableData.push(respJSON[i]);
                }

                table.appendRows(tableData);
                doneCallback();
            } else {
              console.error(xhr.statusText);
            }
          }
        };
        xhr.send(null);
        

        /*$.ajax({
            url: '/today.csv',//InContactAPIBaseEndpoint + endpoint.url,
            type: endpoint.method,
            dataType: endpoint.dataType,
            headers: {
                'Authorization': 'bearer ' + tableau.password
            },
            success: function(response) { 
                var tableData = [];
                var respJSON;

                //console.log('Success: ' + JSON.stringify(response));
                //tableau.log('Success: ' + JSON.stringify(response));
                if(endpoint.dataType == 'csv') {
                    respJSON = parseCSV(response);
                }

                if (table.tableInfo.id == "skillsActivity") {
                    var respJSON = response.skillActivity;
                }

                for (var i = 0, len = respJSON.length; i < len; i++) {
                    tableData.push(skillActivity[i]);
                }

                
                table.appendRows(tableData);
                
            },
            error: function(response) { 
                console.log('Error: ' + JSON.stringify(response));
                tableau.log('Error: ' + JSON.stringify(response));
            }
            
        });*/
    };

    tableau.registerConnector(myConnector);

})();