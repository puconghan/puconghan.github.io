(function () {
    var myConnector = tableau.makeConnector();

    myConnector.getSchema = function (schemaCallback) {
        var connectionData = JSON.parse(tableau.connectionData),
            username = connectionData[0],
            password = connectionData[1],
            host = connectionData[2],
            reportid = connectionData[3],
            cols = [];
        $.ajax({
            url: "https://" + host + ".yieldex.com/YieldexUI/api/v1/rest/queryengine/analysis/" + reportid,
            data: {
                username: username,
                password: password
            },
            dataType: "jsonp",
            crossDomain: true,
            async: false,
            jsonpCallback: "jsonpCallback",
            success: function(resultData) {
                if(resultData.row != null && resultData.row !== undefined && resultData.row[0].columnData != null) {
                    for (var i = 0; i < resultData.row[0].columnData.length; i++) {
                        if(resultData.row[0].columnData[i].name.indexOf("IMPRESSIONS") !== -1) {
                            cols.push({
                                id: resultData.row[0].columnData[i].name.toLowerCase(),
                                dataType: tableau.dataTypeEnum.float
                            });
                        } else if(resultData.row[0].columnData[i].name.indexOf("REVENUE") !== -1) {
                            cols.push({
                                id: resultData.row[0].columnData[i].name.toLowerCase(),
                                dataType: tableau.dataTypeEnum.float
                            });
                        } else {
                            cols.push({
                                id: resultData.row[0].columnData[i].name.toLowerCase(),
                                dataType: tableau.dataTypeEnum.string
                            });
                        }
                    }
                } 
                var tableSchema = {
                    id: "yieldexReportFeeds",
                    alias: "Yieldex Report Feeds",
                    columns: cols
                };
                schemaCallback([tableSchema]);
            }
        });
    };

    myConnector.getData = function (table, doneCallback) {
        var connectionData = JSON.parse(tableau.connectionData),
            username = connectionData[0],
            password = connectionData[1],
            host = connectionData[2],
            reportid = connectionData[3];

        $.ajax({
            url: "https://" + host + ".yieldex.com/YieldexUI/api/v1/rest/queryengine/analysis/" + reportid,
            data: {
                "username": username,
                "password": password
            },
            dataType: "jsonp",
            crossDomain: true,
            async: false,
            jsonpCallback: "jsonpCallback",
            success: function(resultData) {
                var tableData = [];
                if(resultData.row != null && resultData.row !== undefined){
                    for (var j = 0; j < resultData.row.length; j++) {
                        if(resultData.row[j] != null && resultData.row[j].columnData != null){
                            data = {};
                            if(resultData.row[j].columnData != null && resultData.row[j].columnData !== undefined){
                                for (var k = 0, len = resultData.row[j].columnData.length; k < len; k++) {
                                    if(resultData.row[j].columnData[k].name != null && resultData.row[j].columnData[k].value != null){
                                        data[resultData.row[j].columnData[k].name.toLowerCase()] = resultData.row[j].columnData[k].value
                                    }
                                }
                            }
                            tableData.push(data);
                        }
                    }
                }
                table.appendRows(tableData);
                doneCallback();
            }
        });
    };

    tableau.registerConnector(myConnector);

    $(document).ready(function () {
        $("#submitButton").click(function () {
            tableau.connectionName = "Yieldex Report Data Feed";
            var connectDataObj = [$("#username").val(), $("#password").val(), $("#host").val(), $("#reportid").val()];
            tableau.connectionData = JSON.stringify(connectDataObj);
            tableau.submit();
        });
    });
})();
