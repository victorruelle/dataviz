var ctx = {
    w: 1280,
    h: 720,
};

// https://github.com/d3/d3-force
var simulation = d3.forceSimulation()
                   .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(5).strength(0.08))
                   .force("charge", d3.forceManyBody())
                   .force("center", d3.forceCenter(ctx.w / 2, ctx.h / 2));  

// https://github.com/d3/d3-scale-chromatic
var color = d3.scaleOrdinal(d3.schemeAccent);

var createGraphLayout = function(data, svg){
    var max_val = 0;
    var min_val = data.links[0].value;
    for(var i=0; i<data.links.length; i++){
        max_val = Math.max(max_val,data.links[i].value);
        min_val = Math.min(max_val,data.links[i].value);
    }
    var x = d3.scaleLinear()
    .domain([min_val, max_val ])
    .range([1, 10]);
    
    // var lines = ...;
    var lines = svg.append("g").attr("class","links").selectAll("line")
    .data(data.links)
    .enter()
    .append("line")
    .style("opacity",0.5)
    .style("stroke-width",function(data){ return x(data.value);});    

    // var circles = ...;
    var circles = svg.append("g").attr("class","nodes").selectAll("circle")
    .data(data.nodes)
    .enter()
    .append("circle")
    .attr("r","5")
    .style("fill",function(data){return color(data.state);});

    circles.append("title")
    .text( function(data){ return data.city; });
    


    // var graph holding the input data structure created earlier:
    var graph = data;
    simulation.nodes(graph.nodes)
    .on("tick", ticked);
    simulation.force("link")
    .links(graph.links);
    function ticked(){
    // code run at each iteration of the simulation
    lines.attr("x1", function(d){return d.source.x;})
    .attr("y1", function(d){return d.source.y;})
    .attr("x2", function(d){return d.target.x;})
    .attr("y2", function(d){return d.target.y;});
    circles.attr("cx", function(d){return d.x;})
    .attr("cy", function(d){return d.y;});
    }

    circles.call(d3.drag().on("start", startDragging)
                          .on("drag", dragging)
                          .on("end", endDragging));
};

var createViz = function(){
    var svgEl = d3.select("#main").append("svg");
    svgEl.attr("width", ctx.w);
    svgEl.attr("height", ctx.h);
    loadData(svgEl);
};

var loadData = function(svgEl){
    var airports = d3.json("data/airports.json");
    var flights = d3.json("data/flights.json");
    var states = d3.csv("data/states_tz.csv");

    Promise.all([airports,flights,states]).then(
        function(values){
            //values is an array of size 3 (airports,flights,states)
            //console.log(values[0][0]); // a flight json

            //filtering flights
            var filtered_flights = values[1].filter( function(entry){
                return entry.count >= 3000;
            })
            values[1] = filtered_flights;
            //console.log(values[1].length);
            
            // filtering airports          
            var filtered_airports = values[0].filter(function (entry) {
                var test = true;
                for(var i = 0; i<3; i++){
                    if( ["0","1","2","3","4","5","6","7","8","9"].includes(entry.iata[i]) ){
                        test = false;
                        break;
                    }
                }
                return test ; //alternative avec expressions régulières , pattern
            });
            
            filtered_airports = filtered_airports.filter(function (entry) {
                var test = false;
                for( var j = 0; j<values[1].length; j++){
                    if(values[1][j].destination == entry.iata || values[1][j].origin == entry.iata){
                        test = true;
                        break;
                    }
                }
                return test ; //alternative avec expressions régulières , pattern
            });
            values[0] = filtered_airports;
        
           // explorer la fonction foreach !!
            
            data = { "nodes": [] , "links":[]};
            
            for(var i = 0; i < values[0].length; i++) {
                var obj = values[0][i];
                var group = 0;
                for(var j = 0; j<values[2].length; j++){  // alternative "find" function
                    if(values[2][j].State == obj.state){
                        group = values[2][j].TimeZone;
                    }
                }
                var new_obj = {"id" : obj.iata, "group" : group, "state" : obj.state, "city" : obj.city };
                data.nodes.push(new_obj);
            }
            
            for(var i = 0; i < values[1].length; i++){
                var obj = values[1][i];
                var new_obj = { "source" : obj.origin, "target" : obj.destination, "value" : obj.count };        
                data.links.push(new_obj);
            }
            
            console.log(data);


            //data is well constructed !
            createGraphLayout(data,svgEl);
            
        }
    )
};

function startDragging(node){
    if (!d3.event.active){
        simulation.alphaTarget(0.3).restart();
    }
    node.fx = node.x;
    node.fy = node.y;
}

function dragging(node){
    node.fx = d3.event.x;
    node.fy = d3.event.y;
}

function endDragging(node){
    if (!d3.event.active){
        simulation.alphaTarget(0);
    }
    // commenting the following lines out will keep the
    // dragged node at its current location, permanently
    // unless moved again manually
    //node.fx = null;
    //node.fy = null;
}
