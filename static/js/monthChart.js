//SALE MONTH BAR CHART
function saleMonthChart(data){
    //console.log(data)
    //helper functions
    function monthFilter(month){
        return data.filter(function(d){return d['sale_month']==month;});
    }
    function biplotMonthFilter(month){
        let filtered_points =new Array();
        let counter=0;
        for (i in point){
            //console.log(i)
            //console.log(point[i])
            if (point[i][2]==parseInt(month,10)){
                //console.log("1")
                filtered_points[counter]=point[i];
                counter+=1;
            }
        }
        return filtered_points;
    }
    //plotting chart
    let svg = d3.select(".one").append("svg").attr("width","100%").attr("height","100%"),
        margin = 60,
        gridWidth = (window.innerWidth-60)/12,
        width = parseInt(svg.attr("width"),10)/100 *3*gridWidth-margin-30,
        height = parseInt(svg.attr("width"),10)/100 *4*108-margin;
    svg.append("text").attr("stroke","white")
        .attr("transform","translate("+width*0.45+",20)")
        .text("Sales By Month")
    let graph=svg.append("g").attr("transform","translate("+width*0.12+","+height*0.05+")")
    let xaxis = d3.scaleBand().range([0,height]).padding(0.4);
    let yaxis = d3.scaleLinear().range([0,width]);
    var dict = {};
    var maxyval = 0;
    data.forEach(function(d){
        dict[d['sale_month']]= (dict[d['sale_month']] || 0) + 1;
        maxyval = Math.max(maxyval, parseInt(dict[d['sale_month']],10));
        //console.log("max y value: "+ maxyval);
    });
    var xdom = [];
    data.forEach(function(d){
        xdom.push(parseInt(d['sale_month'],10));//turning string to int
    })
    xdom.sort(function(a,b){ return a-b});//sorting int array
    for (let i=0;i<xdom.length;i++){
        let tmp = xdom[i];
        xdom[i] = tmp.toString();
    }
    // str = JSON.stringify(xdom);
    // console.log(str);
    let dom = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sept','Oct','Nov','Dec']
    xaxis.domain(dom);
    //xaxis.domain(data.map(function(d){ return d[selected]; }));
    yaxis.domain([0,d3.max(data,function(d){ return dict[d['sale_month']]; })]);
    graph.append("g")
        .call(d3.axisLeft(xaxis))
        .attr("transform","translate(-2,10)")
        .attr("color","white")
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y",-35)
        .attr("text-anchor","end")
        .attr("stroke","white")
        .text("Month");

    graph.append("g")
        .attr("transform", "translate(0,"+height*1.02+")")
        .attr("color","white")
        .attr("id","xaxisg")
        .call(d3.axisBottom(yaxis))
        .append("text") 
        .attr("text-anchor","end")
        .attr("stroke","white")
        .attr("transform","translate("+width+",28)")
        .text("Frequency");


    let dict_array = new Array();
    let counter = 0;
    for (i in dict){
        if(dict[i]!=null){
            dict_array[counter] = new Array(i,dict[i]);
            counter+=1;
        }
    }
    //console.log(dict_array)
    // console.log(dict_array)
    // console.log(dict)
    let rect = graph.selectAll(".bar")
        .data(dict_array);
    rect
        .enter().append("rect")
        .attr("class", "bar clicker")
        .attr("fill","#E69F00")
        .attr("x", 0)
        .attr("y", function(d,i){
            //console.log(d,i)
            return xaxis(dom[parseInt(d[0],10)-1])+10; })
        .attr("width", function(d){return yaxis(d[1])})
        .attr("height", xaxis.bandwidth())
        .on("click",function(d,i){
            //console.log(d,i)
            //delete old data that is not sale month chart
            let curr = i[0];
            d3.select(".two").selectAll("*").remove();
            d3.select(".three").selectAll("*").remove();
            d3.select(".four").selectAll("*").remove();
            d3.select(".five").selectAll("*").remove();
            d3.select(".six").selectAll("*").remove();
            let filtered_data = monthFilter(curr);
            salePriceChart(filtered_data);
            parallelCoordsChart(filtered_data);
            scatterPlot(filtered_data);
            numFloorsBarChart(filtered_data);
            let filtered_points = biplotMonthFilter(curr);
            biPlot(filtered_points);
            //next we want to make all the other bars opaque
            d3.selectAll(".clicker")
                .attr("opacity", function(d){//make unselected bars opaque
                    //console.log(i,curr,d)
                    if (d[0] == curr){
                        return 1;
                    }
                    return 0.3;
                });
            })
}
