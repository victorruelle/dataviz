var ctx = {
    w: 720,
    h: 720,
    DM: {RV:"Radial Velocity", PT: "Primary Transit", ML: "Microlensing"},
    scaleType : "linear",
    sampleSize : "*"
};

var createScatterPlot = function(sampleSize, scaleType){
    // scatterplot: planet mass vs. star mass
    // vega specification
    var vlSpec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v3.json",
        "data": { "url": "exoplanet.eu_catalog.csv"},
        "transform": [
            {"filter": {"field": "mass", "valid": true}}, // we consider possible errors in the data ; if mass = None / NaN it will be neglected
            {"filter": {"field": "star_mass", "valid": true}}, // we consider possible errors in the data ; if star_mass = None / NaN it will be neglected
            { "filter" : { "field" : "detection_type", "oneOf" : ["Microlensing","Primary Transit","Radial Velocity"] } }
        ],
        "mark": "point",
        "encoding": {
            "x" : { "field": "star_mass", "type": "quantitative", "axis":{"title" : "Mass of the star (measured in mass of sun)"}, "scale" : { "type" : ctx.scaleType} },
            "y" : { "field": "mass", "type": "quantitative", "axis":{"title" : "Mass of the planet (measured in mass of Jupyter)"} , "scale" : { "type" : ctx.scaleType}},
            "color" : { "field" : "discovered", "type": "temporal" },
            "shape" : { "field" : "detection_type", "type": "nominal", "legend" : { "title" : "method of discovery"} },
            "tooltip" : [ { "field" : "mass", "type" : "quantitative"}, { "field" : "discovered", "type" : "temporal","timeUnit" : "year"} ] 
        }
    };

    if (sampleSize != "*" && !isNaN(parseInt(sampleSize))){ 
       vlSpec.transform.push( { "sample" : parseInt(sampleSize) } )
    }

    // see options at https://github.com/vega/vega-embed/blob/master/README.md
    var vlOpts = {width:720, height:720, actions:false};
    // populate div #masses (of size 720x720) with this scatterplot
    vegaEmbed("#viz", vlSpec, vlOpts);

};

var createHistogram = function(){
    
    var vlSpec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v3.json",
        "data": { "url": "exoplanet.eu_catalog.csv"},
        "transform": [
            {"filter": {"field": "mass", "valid": true}}, // we consider possible errors in the data ; if mass = None / NaN it will be neglected
            { "filter" : { "field" : "detection_type", "oneOf" : ["Microlensing","Primary Transit","Radial Velocity"] } }
        ],
        "mark" : "bar",
        "encoding" : {
            "x" : { "bin": {"step": 3}, "field" : "mass", "type" : "quantitative", "axis" : { "title" : "Mass (MJup)"} },
            "y" : { "aggregate" : "count", "field" : "mass", "type" : "quantitative", "axis" : { "title" : "count" } },
        }
    };

    var vlOpts = { width : 380, height : 380, actions:false };
    vegaEmbed("#massHist",vlSpec,vlOpts);
};

var createLinePlot = function(){
    vlSpec = {
        "$schema": "https://vega.github.io/schema/vega-lite/v3.json",
        "data": {
            "url": "exoplanet.eu_catalog.csv",
        },
        "transform": [
            {"filter": {"field": "detection_type", "oneOf": ["Radial Velocity", "Primary Transit", "Microlensing"]}},
            {"filter": {"field": "star_mass", "valid": true}},
            {"filter": {"field": "mass", "valid": true}},
            {"sort": [{"field": "discovered"}],
             "window": [{"op": "count", "as": "cumulative_count"}],
             "frame": [null, 0]}
        ],
        "layer":[
            {
                "mark": "area",
                "encoding": {
                    "x": {
                        "field": "discovered",
                        "type": "temporal",
                        "timeUnit": "year"
                    },
                    "y": {
                        "field": "cumulative_count",
                        "type": "quantitative"
                    },
                    "color": {"value": "#EEE"}
                },
            },
            {
                "mark": "line",
                "encoding": {
                    "x": {
                        "field": "discovered",
                        "type": "temporal",
                        "timeUnit": "year",
                        "axis":{"title": "Year"}
                    },
                    "y": {
                        "aggregate": "count",
                        "field": "*",
                        "type": "quantitative",
                        "axis":{"title": "Count"}
                    },
                    "color": {
                        "field": "detection_type",
                        "type": "nominal",
                        "legend": {"title": "Detection Method"},
                        "scale": {
                            "domain": ["Radial Velocity", "Primary Transit", "Microlensing"],
                            "range": ["#e45756","#8241a0","#4c78a8",]
                        },
                    },
                },
        }]
    };
    vlOpts = {width:300, height:300, actions:false};
    vegaEmbed("#discoverTime", vlSpec, vlOpts);
};

var createViz = function(){
    createScatterPlot('*', 'linear');
    createHistogram();
    createLinePlot();
};


var handleKeyEvent = function(e){
    if (e.keyCode === 13){
        // enter
        e.preventDefault();
        setSample();
    }
};

var updateScatterPlot = function(){
    createScatterPlot(ctx.sampleSize, ctx.scaleType);
};

var setScale = function(){
    var scaleSel = document.querySelector('#scaleSel').value;
    ctx.scaleType = scaleSel;
    updateScatterPlot();
};

var setSample = function(){
    var sampleVal = document.querySelector('#sampleTf').value;
    if (sampleVal.trim()===''){
        return;
    }
    ctx.sampleSize = sampleVal;
    updateScatterPlot();
};
