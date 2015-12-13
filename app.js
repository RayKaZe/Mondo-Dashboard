var transactions = {};
var data1;
var dataTemp1;
var data2;
var dataTemp2;
var total1 = 0;
var total2 = 0;

var width = 300,
    height = 300,
    radius = Math.min(width, height) / 2;

var color1 = d3.scale.ordinal()
    .range(["#ff8c00", "#d0743c", "#a05d56", "#6b486b", "#7b6888", "#8a89a6", "#98abc5"]);

var color2 = d3.scale.ordinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

var arc = d3.svg.arc()
    .outerRadius(radius - 10)
    .innerRadius(0);

var labelArc = d3.svg.arc()
    .outerRadius(radius - 50)
    .innerRadius(radius - 50);

var labelArc2 = d3.svg.arc()
    .outerRadius(radius - 85)
    .innerRadius(radius - 85);

var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d.val; });

var svg1 = d3.select("#graph1").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var svg2 = d3.select("#graph2").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

function ajaxRequest(account_id, access_token) {
    $.ajax( 
        {
            url: "https://production-api.gmon.io/transactions",
            data: {"account_id": account_id},
            type: "GET",
            headers: {
                'Authorization': 'Bearer ' + access_token
            }  
        }
    )
    .done( function(data){
        transactions = data;
        assembleData();
        drawPieGraph();
    })
    .fail( function () {
        alert("An error occured.");
    });
}

function parseForm(form) {
    access_token = form.access_token.value;
    account_id = form.account_id.value;
    ajaxRequest(account_id, access_token);
}

function assembleData() {
    data1 = [];
    dataTemp1 = {};
    data2 = [];
    dataTemp2 = {};

    for (var i in transactions.transactions) {
        var amount = transactions.transactions[i].amount;
        var category = transactions.transactions[i].category;

        if(amount < 0) {
            if(category in dataTemp1) dataTemp1[category] += amount;
            else dataTemp1[category] = amount;
        } else {
            if(category in dataTemp2) dataTemp2[category] += amount;
            else dataTemp2[category] = amount;
        }
    }

    total1 = 0;
    total2 = 0;

    for(var elem in dataTemp1) {
        data1.push({"key": elem, "val": Math.abs(dataTemp1[elem])});
        total1 += Math.abs(dataTemp1[elem]);
    }
    for(var elem in dataTemp2) {
        data2.push({"key": elem, "val": dataTemp2[elem]});
        total2 += (dataTemp2[elem]);
    }
}

function drawPieGraph() {
    var heads = d3.selectAll("h3").style("display", "block");

    //graph 1
    var g = svg1.selectAll(".arc")
      .data(pie(data1))
    .enter().append("g")
      .attr("class", "arc");

    g.append("path")
      .attr("d", arc)
      .style("fill", function(d) { return color1(d.data.key); });

    g.append("text")
      .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
      .text(function(d) { 
        var fraction = d.data.val/total1;
        fraction = Math.round(fraction*10000) / 100;
        return d.data.key + " (" + fraction + "%)"; 
        })
      .style("fill","white");

    g.append("text")
      .attr("transform", function(d) { return "translate(" + labelArc2.centroid(d) + ")"; })
      .text(function(d) { 
        var result = "-£" + (d.data.val/100);
        if (d.data.val%100 === 0) result += ".00";
        else if (d.data.val%10 === 0) result += ".0";
        return result;
        })
      .style("fill","white")
      .style("font-size","24px");

    //graph 2
    var g = svg2.selectAll(".arc")
      .data(pie(data2))
    .enter().append("g")
      .attr("class", "arc");

    g.append("path")
      .attr("d", arc)
      .style("fill", function(d) { return color2(d.data.key); });

    g.append("text")
      .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
      .text(function(d) { 
        var fraction = d.data.val/total2;
        fraction = Math.round(fraction*10000) / 100;
        return d.data.key + " (" + fraction + "%)"; 
        })
      .style("fill","white");

    g.append("text")
      .attr("transform", function(d) { return "translate(" + labelArc2.centroid(d) + ")"; })
      .text(function(d) { 
        var result = "£" + (d.data.val/100);
        if (d.data.val%100 === 0) result += ".00";
        else if (d.data.val%10 === 0) result += ".0";
        return result;
      })
      .style("fill","white")
      .style("font-size","24px");
}