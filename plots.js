function init() {
  var selector = d3.select("#selDataset");
  
  d3.json("samples.json").then((data) => {
    console.log(data);
    var sampleNames = data.names;
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });
    buildMetadata(940);
    buildCharts(940);
  })
}
  
init();

function optionChanged(newSample) {
buildMetadata(newSample);
buildCharts(newSample);
}

function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    var PANEL = d3.select("#sample-metadata");
    var wfreq = result.wfreq;
    console.log(wfreq);
  
    PANEL.html("");
    PANEL.append("h6").text("ID: " + result.id);
    PANEL.append("h6").text("ETHNICITY: " + result.ethnicity);
    PANEL.append("h6").text("GENDER: " + result.gender);
    PANEL.append("h6").text("AGE: " + result.age);
    PANEL.append("h6").text("LOCATION: " + result.location);
    PANEL.append("h6").text("BBTYPE: " + result.bbtype);
    PANEL.append("h6").text("WFREQ: " + result.wfreq);
    
    /* Gauge chart to plot the weekly washing frequency of the individual, created based on:
    - [https://plotly.com/~bigpimpatl/4/#code];
    - [https://com2m.de/blog/technology/gauge-charts-with-plotly/]; */
    let traceGauge = { 
      type: 'pie',
      showlegend: false,
      hole: 0.4,
      rotation: 90,
      values: [1, 1, 1, 1, 1, 1, 1, 1, 1, 9],
      text: ["0-1", "1-2", "2-3", "3-4", "4-5", "5-6", "6-7", "7-8", "8-9", ""],
      marker: {
        colors: ["E8F5E9", "C8EAD1", "A8E0B7", "73C088", "47A64A", "3C8C3F", "2C662E", "214D22", "163317", "FFFFFF"]
      },
      direction: "clockwise",
      textinfo: "text",
      textposition: "inside",
      hoverinfo: "skip",
      };

      // Build chart needle
      let degree = 180 - (20 * result.wfreq);
      let radius = 0.25;
      let radian = degree * Math.PI / 180;
      let x = 0.5 + (radius * Math.cos(radian));
      let y = 0.5 + (radius * Math.sin(radian));
      
      var gaugeLayout = {
        title: "Bellybutton Washing Frequency",
        shapes: [{
          type: "line",
          x0: 0.5,
          y0: 0.5,
          x1: x,
          y1: y,
        line: {
          color: "8B0000",
          width: 4
        }
        }],
      }
    
    //Draw Gauge chart
    Plotly.newPlot("gauge", [traceGauge], gaugeLayout); 
  });
}
  
// Function to build two charts for selected sample ID
function buildCharts(sample) {
  d3.json("samples.json").then((data) => {
    var inputData = data.samples;
    // Output data filtered by ID
    var outputData = inputData.filter(sampleObj => sampleObj.id == sample);
    // Output data arranged in descending order based on sample_values
    var arrangedData = outputData.sort(function(a,b){
      (parseFloat(b.sample_values) - parseFloat(a.sample_values))
    });
        
    // Mapping output params for all charts
    var sample_values = arrangedData.map(arrangedData => arrangedData.sample_values);
    var otu_ids = arrangedData.map(arrangedData => arrangedData.otu_ids);
    var otu_labels = arrangedData.map(arrangedData => arrangedData.otu_labels);
    arrangedData = arrangedData[0];
    sample_values = arrangedData["sample_values"];
    otu_ids = arrangedData["otu_ids"];
    otu_labels = arrangedData["otu_labels"];
    //console.log(sample_values, otu_ids, otu_labels);
    
    // Bar chart of the top ten bacterial species in a volunteer’s navel
    let traceBar = {
      x: sample_values.slice(0, 10),
      y: otu_ids.slice(0, 10).map(otu_id => "OTU " + otu_id),
      text: otu_labels.slice(0, 10),
      name: "Top ten bacterial species",
      type: "bar",
      orientation: "h"
    };
      
    let layoutBar = {
      title: "Top ten bacterial species",
      yaxis: {
        autorange: "reversed"
      }
    };
    
    // Bubble chart to visualize the relative frequency of all the bacterial species found in a volunteer’s navel
    let traceBubble  = {
      x: otu_ids,
      y: sample_values,
      text: otu_labels,
      type: "bubble",
      mode: "markers",
      marker: {
        color: otu_ids,
        size: sample_values
      }
    };
    
    let layoutBubble = {
      colorscale: "sequential"
    };
  
    // Draw two plots for selected sample ID 
    Plotly.newPlot("bar", [traceBar], layoutBar);
    Plotly.newPlot("bubble", [traceBubble], layoutBubble);
  });
}