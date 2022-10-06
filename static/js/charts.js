//SALE PRICE BAR CHART
function salePriceChart(data){
    let svg = d3.select(".six").append("svg").attr("width","100%").attr("height","100%"),
        margin = 100,
        gridWidth = (window.innerWidth-60)/12,
        width = parseInt(svg.attr("width"),10)/100 *6*gridWidth-margin,
        height = parseInt(svg.attr("width"),10)/100 *5*108-margin;
    svg.append("text").attr("stroke","white")
        .attr("transform","translate("+width*0.48+",20)")
        .text("Sale Price")
    let xaxis = d3.scaleLinear().range([0,width]);
    let yaxis = d3.scaleLinear().range([height,0]);
    //console.log([0,d3.max(data,function(d){return parseInt(d['sale_price']/100000,10);})])
    xaxis.domain([0,d3.max(data,function(d){return parseFloat(d['sale_price']*1.1/100000);})])
    let graph=svg.append("g").attr("transform","translate("+width*0.07+","+height*0.09+")")
    graph.append("g")
        .attr("transform", "translate("+0+"," +height + ")")
        .call(d3.axisBottom(xaxis))
        .attr("color","white")
        .append("text")
        .attr("text-anchor","end")
        .attr("stroke","white")
        .text("Hundred Thousand USD")
        .attr("transform","translate("+width+",28)");
    let histogram = d3.histogram()
        .domain(xaxis.domain())
        .thresholds(xaxis.ticks(50));
    let storage =[];
    data.forEach(function(d){
        storage.push(d['sale_price']/100000);
    })
    let bins = histogram(storage);
    //console.log(bins)
    yaxis.domain([0,d3.max(bins, function(d){return d.length;})]);
    graph.append("g")
        .call(d3.axisLeft(yaxis).tickFormat(function(d){
            //console.log(d)
            return d;
        })
        .ticks(10))
        .attr("color","white")
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y","-35")
        .attr("text-anchor","end")
        .attr("stroke","white")
        .text("Frequency");
    let bars = graph.selectAll(".bar")
        .data(bins);
    bars
        .enter()
        .append("rect")
        .attr("class","bar")
        .attr("x",1)
        .attr("transform", function(d){
            return "translate(" +xaxis(d.x0) +"," + yaxis(d.length) + ")";
        })
        .attr("width", function(d){ return xaxis(d.x1) - xaxis(d.x0)})
        .attr("height", function(d){ return height-yaxis(d.length);})
        .attr("fill", "#E69F00");

    graph.call(d3.brushX()
        .extent([ [0,0], [6*gridWidth-width*0.095,6*93-height*0.21]])
        .on("end",updateChart));
    function updateChart({selection}){
        const [x0,x1] = selection;
        if (x0!=x1){
            //console.log("brushed")
            svg.selectAll(".bar")
            .attr("fill",function(d){
                //console.log(d,xaxis(d.x0),xaxis(d.x1),x0,x1)
                if (xaxis(d.x0)>=x0 && xaxis(d.x1)<=x1){
                    return "brown";
                }
                return '#E69F00';
            });
            d3.select(".two").selectAll("*").remove();
            d3.select(".three").selectAll("*").remove();
            d3.select(".four").selectAll("*").remove();
            d3.select(".five").selectAll("*").remove();
            d3.select(".one").selectAll("*").remove();
            let filtered_data = priceFilter(x0,x1);
            // salePriceChart(filtered_data);
            saleMonthChart(filtered_data);
            parallelCoordsChart(filtered_data);
            scatterPlot(filtered_data);
            numFloorsBarChart(filtered_data);
            biPlot(biplotPriceFilter(x0,x1));
            //console.log(filtered_data)
        }
    }
    function priceFilter(x0,x1){
        let maxPrice = d3.max(data,function(d){return parseInt(d['sale_price'],10)});
        let lowerBound = x0/(6*gridWidth-width*0.095) * maxPrice;
        let upperBound = x1/(6*gridWidth-width*0.095)*maxPrice;
        //console.log(lowerBound,upperBound)
        return data.filter(function(d){
            return d['sale_price']>=lowerBound && d['sale_price']<=upperBound;
        });

    }
    function biplotPriceFilter(x0,x1){
        let maxPrice = d3.max(data,function(d){return parseInt(d['sale_price'],10)});
        let lowerBound = x0/(6*gridWidth-width*0.095) * maxPrice;
        let upperBound = x1/(6*gridWidth-width*0.095)*maxPrice;
        let res = new Array();
        let counter=0;
        for (i in point){
            if (point[i][3]>=lowerBound && point[i][3]<=upperBound){
                res[counter] = point[i];
                counter+=1;
            }
        }
        return res;
    }
}


//PARALLEL COORDINATES CHART
function parallelCoordsChart(data){
    let svg = d3.select(".three").append("svg").attr("width","100%").attr("height","100%"),
        margin = 50,
        gridWidth = (window.innerWidth-60)/12,
        width = parseInt(svg.attr("width"),10)/100 *6*gridWidth-2*margin,
        height = parseInt(svg.attr("width"),10)/100 *4*108-margin-20;
    //title
    svg.append("text").attr("stroke","white")
        .attr("transform","translate("+width*0.45+",15)")
        .text("Parallel Coordinates")
    let parchart=svg.append("g").attr("transform","translate("+width*.07+","+height*0.13+")")
    let variables = ['gross_sqft','total_units','NumFloors','sale_price','land_sqft','NumBldgs','sale_month','sale_day']
    let y={}
    for(let i in variables){
        let name = variables[i]
        y[name] = d3.scaleLinear()
            .domain(d3.extent(data,function(d){return parseInt(d[name],10);}))
            .range([height,0])
    }
    let x = d3.scalePoint()
        .range([0,width-10])
        .domain(variables);

    function path(d){
        return d3.line()(variables.map(function(p){
            return [x(p),y[p](parseInt(d[p],10))];
        }));
    }
    parchart.selectAll("myPaths")
        .data(data)
        .enter().append("path")
        .attr("d",path)
        .style("fill","none")
        .style("stroke",function(d){
            let curr = parseFloat(d['NumFloors']);
            //console.log(curr)
            if(curr){
                if(curr<2){
                    return "#009E73";
                }
                else if(curr<3){
                    return "#0072B2";
                }
                else return "#CC79A7";
            }
        })
        .style("opacity",0.1);

    parchart.selectAll("myAxises")
        .data(variables).enter()
        .append("g")
        .attr("transform",function(d){return "translate("+x(d)+")";})
        .each(function(d){
            d3.select(this).call(d3.axisLeft().scale(y[d]));
        })
        .attr("color","white")
        .append("text")
        .style("text-anchor","middle")
        .attr("y","-9")
        .text(function(d){return d;})
        .style("fill","white")
}




//SCATTER PLOT
function scatterPlot(data){
    let svg = d3.select(".two").append("svg")
        .attr("width","100%").attr("height","100%"),
        margin = 100,
        gridWidth = (window.innerWidth-60)/12,
        width = parseInt(svg.attr("width"),10)/100 *3*gridWidth-margin-20,
        height = parseInt(svg.attr("width"),10)/100 *5*108-margin;
    //title
    svg.append("text").attr("stroke","white")
        .attr("transform","translate("+width*0.45+","+25+")")
        .text("Gross Sqft VS Sale Price")
    let graph=svg.append("g").attr("transform","translate("+width*0.18+","+height*0.1+")")
    let xextent = d3.extent(data,function(d){return parseInt(d['gross_sqft'],10);})
    let yextent = d3.extent(data,function(d){return parseInt(d['sale_price'],10);})
    let x = d3.scaleLinear().range([0,width]).domain([0,xextent[1]]);
    let y = d3.scaleLinear().range([height,0]).domain([0,yextent[1]]);
    graph.append("g")
        .call(d3.axisBottom(x))
        .attr("color","white")
        .attr("transform","translate(0,"+height+")")
        .append("text") 
        .attr("text-anchor","end")
        .attr("stroke","white")
        .attr("transform","translate("+width+",28)")
        .text("Gross Sqft (ft^2)");
    graph.append("g")
        .call(d3.axisLeft(y))
        .attr("color","white")
        .attr("transform","translate(0,0)")
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y",-60)
        .attr("text-anchor","end")
        .attr("stroke","white")
        .text("Sale Price (USD)");
    let dots = graph.selectAll("myCircles")
        .data(data).enter()
        .append("circle")
        .attr("class","brushed")
        .attr("cx", function(d){return x(parseInt(d['gross_sqft'],10)) })
        .attr("cy", function(d){return y(parseInt(d['sale_price'],10)) })
        .attr("r",2)
        .attr("stroke", function(d){
            let curr = parseFloat(d['NumFloors']);
            //console.log(curr)
            if(curr){
                if(curr<2){
                    return "#009E73";
                }
                else if(curr<3){
                    return "#0072B2";
                }
                else return "#CC79A7";
            }

        });
    svg.call(d3.brush()
        .extent([ [0,0], [3*gridWidth,6*93]])
        .on("end",updateChart));
    
    function brushFilter(x0,y0,x1,y1){
        return data.filter(function(d){
            let cx=x(parseInt(d['gross_sqft'],10))+width*0.18;
            let cy=y(parseInt(d['sale_price'],10))+height*0.1;
            return cx>=x0 && cx<=x1 && cy>=y0 && cy<=y1;
        });
    }
    function biplotScatFilter(x0,y0,x1,y1){
        let filtered_points = new Array();
        let counter = 0;
        for (i in point){
            //console.log(point[i])
            let cx=x(parseInt(point[i][4],10))+width*0.18;
            let cy=y(parseInt(point[i][3],10))+height*0.1;
            if (cx>=x0 && cx<=x1 && cy>=y0 && cy<=y1){
                filtered_points[counter]=point[i];
                counter+=1;
            }
        }
        return filtered_points;
    }
    function updateChart({selection}){
        //console.log(selection)
        let [[x0,y0],[x1,y1]] = selection;
        //console.log(x0,y0,x1,y1)
        dots.attr("stroke","gray")
            .filter(function(d){
                //console.log(d)
                let cx=x(parseInt(d['gross_sqft'],10))+width*0.18;
                let cy=y(parseInt(d['sale_price'],10))+height*0.1;
                return cx>=x0 && cx<=x1 && cy>=y0 && cy<=y1;
            })
            .attr("stroke",function(d){
                let curr = parseFloat(d['NumFloors']);
                //console.log(curr)
                if(curr){
                    if(curr<2){
                        return "#009E73";
                    }
                    else if(curr<3){
                        return "#0072B2";
                    }
                    else return "#CC79A7";
                }
            });
        //now filter data and update other charts
        let filtered_data = brushFilter(x0,y0,x1,y1);
        let biplot_data = biplotScatFilter(x0,y0,x1,y1);
        // console.log(biplot_data)
        //console.log(filtered_data)
        d3.select(".one").selectAll("*").remove();
        d3.select(".three").selectAll("*").remove();
        d3.select(".four").selectAll("*").remove();
        d3.select(".five").selectAll("*").remove();
        d3.select(".six").selectAll("*").remove();
        salePriceChart(filtered_data);
        saleMonthChart(filtered_data);
        parallelCoordsChart(filtered_data);
        numFloorsBarChart(filtered_data);
        biPlot(biplot_data);
        // scatterPlot(filtered_data);


    }
}



//BIPLOT
function biPlot(points){
    let svg = d3.select(".five").append("svg").attr("width","100%").attr("height","100%"),
        margin = 50,
        gridWidth = (window.innerWidth-60)/12,
        width = parseInt(svg.attr("width"),10)/100 *3*gridWidth-margin-20,
        height = parseInt(svg.attr("width"),10)/100 *6*108-margin;
    //title
    svg.append("text").attr("stroke","white")
        .attr("transform","translate("+width*0.5+",15)")
        .text("Biplot")
    let biplot=svg.append("g").attr("transform","translate(40,40)")
    var xextent = d3.extent(points,function(d){return d[0]});
    var yextent = d3.extent(points,function(d){return d[1]});
    //console.log(xextent,yextent)
    //console.log(Math.max(Math.abs(xextent[0]),xextent[1]))
    var x = d3.scaleLinear().range([0,width]).domain([-1*Math.max(Math.abs(xextent[0]),xextent[1]),Math.max(Math.abs(xextent[0]),xextent[1])]);
    // console.log(d3.max(points,function(d){
    //     return d[1];
    // }))
    var y = d3.scaleLinear().range([height,0]).domain([-1*Math.max(Math.abs(yextent[0]),yextent[1]),Math.max(Math.abs(yextent[0]),yextent[1])]);
    biplot.append("g")
        .call(d3.axisLeft(y))
        .attr("transform","translate("+width/2+",0)")
        .attr("color","white")
        .append("text")
        .attr("stroke","white")
        .attr("stroke-width","1px")
        .attr("text-anchor","end")
        .text("PCA2");
    biplot.append("g")
        .attr("transform","translate(0,"+height/2+")")
        .attr("color","white")
        .call(d3.axisBottom(x))
        .append("text")
        .attr("stroke","white")
        .attr("stroke-width","1px")
        .attr("transform","rotate(-90)")
        .attr("text-anchor","start")
        .text("PCA1");
    //dots
    biplot.append("g")
        .selectAll(".circle")
        .data(points)
        .enter()
        .append("circle")
        .attr("cx",function(d){return x(d[0]);})
        .attr("cy", function(d){return y(d[1]);})
        .attr("r",2)
        .attr("stroke",function(d){
            let curr = parseFloat(d[5]);
            //console.log(curr)
            if(curr){
                if(curr<2){
                    return "#009E73";
                }
                else if(curr<3){
                    return "#0072B2";
                }
                else return "#CC79A7";
            }
        })
        .attr("fill","none");
    //add vectors
    var vecs = [];
    for (let i in d3.range(8)){
        //console.log(eig_pairs[0][1][i])

        vecs.push([eig_pairs[0][1][i],eig_pairs[1][1][i]]);
    }
    //console.log(vecs)
    biplot.append("g")
        .selectAll(".vecs")
        .data(vecs).enter()
        .append("circle")
        .attr("cx",function(d){return x(d[0])})
        .attr("cy",function(d){return y(d[1])})
        .attr("r",2)
        .style("fill","white");
    biplot.append("g")
        .selectAll(".lines")
        .data(vecs).enter()
        .append("line")
        .style("stroke", "white")
        .attr("x1", x(0))
        .attr("y1", y(0))
        .attr("x2", function(d){return x(d[0]);})
        .attr("y2", function(d){return y(d[1]);})
    biplot.append("g")
        .selectAll("labels")
        .data(vecs).enter()
        .append("text")
        .style("stroke","white")
        .attr("stroke-width","1px")
        .attr("x",function(d){return x(d[0])})
        .attr("y",function(d){return y(d[1])})
        .attr("text-anchor","end")
        .text(function(d,i){
            return "v"+i;
        })
}
function numFloorsBarChart(data){
    let svg = d3.select(".four").append("svg").attr("width","100%").attr("height","100%"),
        margin = 50,
        gridWidth = (window.innerWidth-80)/12,
        width = parseInt(svg.attr("width"),10)/100 *3*gridWidth-margin-60,
        height = parseInt(svg.attr("width"),10)/100 *3*108-margin-40;
    //title
    svg.append("text").attr("stroke","white")
        .attr("transform","translate("+width*0.45+",25)")
        .text("Number Of Floors")
    let graph=svg.append("g").attr("transform","translate("+width*0.15+","+height*0.15+")")
    let xaxis = d3.scaleLinear().range([0,width]);
    let yaxis = d3.scaleLinear().range([height,0]);
    //console.log([0,d3.max(data,function(d){return parseInt(d['sale_price']/100000,10);})])
    xaxis.domain([0,d3.max(data,function(d){return parseFloat(d['NumFloors'])*1.25;})])
    graph.append("g")
        .attr("transform", "translate("+0+"," +height + ")")
        .call(d3.axisBottom(xaxis))
        .attr("color","white")
        .append("text")
        .attr("text-anchor","end")
        .attr("stroke","white")
        .text("Floors")
        .attr("transform","translate("+width+",28)");
    let histogram = d3.histogram()
        .domain(xaxis.domain())
        .thresholds(xaxis.ticks(5));
    let storage =[];
    data.forEach(function(d){
        storage.push(d['NumFloors']);
    })
    let bins = histogram(storage);
    //console.log(bins)
    //console.log(bins)
    yaxis.domain([0,d3.max(bins, function(d){return d.length;})]);
    graph.append("g")
        .call(d3.axisLeft(yaxis).tickFormat(function(d){
            //console.log(d)
            return d;
        })
        .ticks(10))
        .attr("color","white")
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y","-35")
        .attr("text-anchor","end")
        .attr("stroke","white")
        .text("Frequency");
    let bars = graph.selectAll(".bar")
        .data(bins);
    bars
        .enter()
        .append("rect")
        .attr("class","bar2 clicker2")
        .attr("x",1)
        .attr("transform", function(d){
            return "translate(" +xaxis(d.x0) +"," + yaxis(d.length) + ")";
        })
        .attr("width", function(d){ return xaxis(d.x1) - xaxis(d.x0)})
        .attr("height", function(d){ return height-yaxis(d.length);})
        .attr("fill", function(d){
            let curr = d[0];
            if(curr){
                if(curr<2){
                    return "#009E73";
                }
                else if(curr<3){
                    return "#0072B2";
                }
                else return "#CC79A7";
            }
        })
        .on("click", function(d,i){
            let extent = d3.extent(i);
            d3.select(".two").selectAll("*").remove();
            d3.select(".three").selectAll("*").remove();
            d3.select(".one").selectAll("*").remove();
            d3.select(".five").selectAll("*").remove();
            d3.select(".six").selectAll("*").remove();
            let filtered_data = floorFilter(extent);
            //console.log(filtered_data)
            salePriceChart(filtered_data);
            parallelCoordsChart(filtered_data);
            scatterPlot(filtered_data);
            saleMonthChart(filtered_data);
            //console.log(floorPointFilter(extent))
            biPlot(floorPointFilter(extent));
            d3.selectAll(".clicker2")
                .attr("opacity",function(d){
                    let curr = d3.extent(d);
                    if (curr[0]==extent[0]){
                        return 1;
                    }
                    else{
                        return 0.3;
                    }
                })
        });
    function floorFilter(extent){
        let min = parseFloat(extent[0]);
        let max = parseFloat(extent[1]);
        return data.filter(function(d){
            return parseFloat(d['NumFloors'])>= min && parseFloat(d['NumFloors'])<=max;
        })
    }
    function floorPointFilter(extent){
        let min = parseFloat(extent[0]);
        let max = parseFloat(extent[1]);
        let filtered_points = new Array();
        let counter = 0;
        for (i in point){
            if (parseFloat(point[i][5])>=min&&parseFloat(point[i][5])<=max){
                filtered_points[counter]=point[i];
                counter+=1;
            }
        }
        return filtered_points;
    }
    
}
