
//d3.csv("static/data/randomsampbrooklyn.csv").then(function(datas){
d3.csv("static/data/KingsCountySales_no_outliers.csv").then(function(datas){
    window.onresize = function(){ location.reload(); }
    function run(data){
        salePriceChart(data);
        saleMonthChart(data);
        parallelCoordsChart(data);
        scatterPlot(data);
        numFloorsBarChart(data);
        biPlot(point);
    }
    run(datas);


})
