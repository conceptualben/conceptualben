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

    var InContactAPIBaseEndpoint = 'https://api-c11.incontact.com/inContactAPI/services/v8.0/';

    var endpoints = {
        skillsActivity: {
            url: '/skills/activity',
            params: [
                'fields',
                'updatedSince'
            ]
        }//,
        //skillsSkillIdActivity: '/skills/{skillId}/activity'
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
        
        /*var skillsSkillIdActivityTable = {
            id: "skillsSkillIdActivity",
            alias: "Skills Activity for Skill Id",
            columns: [
                { id: "serverTime", dataType: tableau.dataTypeEnum.datetime,
                { id: "businessUnitId", dataType: tableau.dataTypeEnum.int,
                { id: "agentsACW", dataType: tableau.dataTypeEnum.int,
                { id: "agentsAvailable", dataType: tableau.dataTypeEnum.int,
                { id: "agentsIdle", dataType: tableau.dataTypeEnum.int,
                { id: "agentsLoggedIn", dataType: tableau.dataTypeEnum.int,
                { id: "agentsUnavailable", dataType: tableau.dataTypeEnum.int,
                { id: "agentsWorking", dataType: tableau.dataTypeEnum.int,
                { id: "campaignId", dataType: tableau.dataTypeEnum.int,
                { id: "campaignName", dataType: tableau.dataTypeEnum.string,
                { id: "contactsActive", dataType: tableau.dataTypeEnum.int,
                { id: "isOutbound"dataType: tableau.dataTypeEnum.bool,
                { id: "mediaTypeId", dataType: tableau.dataTypeEnum.int,
                { id: "mediaTypeName", dataType: tableau.dataTypeEnum.string,
                { id: "queueCount", dataType: tableau.dataTypeEnum.int,
                { id: "serviceLevel", dataType: tableau.dataTypeEnum.int,
                { id: "serviceLevelGoal", dataType: tableau.dataTypeEnum.int,
                { id: "serviceLevelThreshold", dataType: tableau.dataTypeEnum.int,
                { id: "skillName", dataType: tableau.dataTypeEnum.string,
                { id: "skillId", dataType: tableau.dataTypeEnum.int,
                { id: "skillQueueCount", dataType: tableau.dataTypeEnum.int,
                { id: "personalQueueCount", dataType: tableau.dataTypeEnum.int,
                { id: "parkedCount", dataType: tableau.dataTypeEnum.int
            ]
        };*/

        schemaCallback([skillsActivityTable/*, skillsSkillIdActivity*/]);
    };

    myConnector.getData = function (table, doneCallback) {
        var dateObj = JSON.parse(tableau.connectionData),
            dateString = "updatedSince=" + dateObj.startDate + "&endtime=" + dateObj.endDate,
            endpoint = InContactAPIBaseEndpoint + "skills/activity?" + dateString;

        var endpoint = InContactAPIBaseEndpoint + endpoints.skillsActivity.url;
        console.log(tableau.password);

        $.ajax({
            url: 'https://api-c11.incontact.com/inContactAPI/services/v8.0/skills/activity?updatedSince=2017-03-08',//type: 'GET',
            dataType: 'json',
            headers: {
                'Authorization': 'bearer ' + tableau.password
            },
            success: function(resp) { 
                var tableData = [];

                console.log('Success: ' + JSON.stringify(resp));
                tableau.log('Success: ' + JSON.stringify(resp));

                if (table.tableInfo.id == "skillsActivity") {
                    var skillActivity = resp.skillActivity;

                    for (var i = 0, len = skillActivity.length; i < len; i++) {
                        tableData.push(skillActivity[i]);
                    }
                }
                
                table.appendRows(tableData);
                
            },
            error: function(resp) { 
                console.log('Error: ' + JSON.stringify(resp));
                tableau.log('Error: ' + JSON.stringify(resp));
            }
            
        });
    };

    tableau.registerConnector(myConnector);

})();