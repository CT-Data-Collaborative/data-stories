$.getJSON("static/data/troops_with_stops.geojson", function(data1) {
  $.getJSON("static/data/towns_with_stops.geojson", function(data) {
          // Define pattern for municipalities with no department

          var stripes = new L.StripePattern(
            {
              weight: 1,
              angle: -45,
              spaceWeight: 1
            });


          // Interactions

          function highlightFeature(e) {
            var layer = e.target;
            layer.setStyle({
                    weight: 5,
                    color: '#666',
                    dashArray: '',
                    fillOpacity: 0.7
                });

            if (!L.Browser.ie && !L.Browser.opera) {
                layer.bringToFront();
            }
            info.update(layer.feature.properties);
            }

          function townResetHighlight(e) {
              townJSON.resetStyle(e.target);
              info.update();
          }

          function troopsResetHighlight(e) {
              troopsJSON.resetStyle(e.target);
              info.update();
          }

          function townOnEachFeature(feature, layer) {
              layer.on({
                  mouseover: highlightFeature,
                  mouseout: townResetHighlight
              });
          }

          function troopsOnEachFeature(feature, layer) {
              layer.on({
                  mouseover: highlightFeature,
                  mouseout: troopsResetHighlight
              });
          }


          // Set up breakpoints for Troops
          troopStopsCounts = data1.features.map(function(t) {
            return +t.properties.Stops;
          });

          troopBreaks = ss.jenks(troopStopsCounts, 3);


          function getTroopColor(d) {
            return d > troopBreaks[3] ? '#016c59' :
                   d > troopBreaks[2] ? '#1c9099' :
                   d > troopBreaks[1] ? '#67a9cf' :
                   d > troopBreaks[0] ? '#bdc9e1' :
                                   '#f6eff7';
          }

          function troopStyle(feature) {
            styleObj = {
              opacity: 1,
              weight: 1,
              color: '#464646',
              fillOpacity: 1,
              fillColor: getTroopColor(feature.properties.Stops)
            };
            return styleObj;
          }



          // Set up breakpoints for Towns
          stopsCount = data.features.map(function(t) {
            return +t.properties.Stops
          });

          stopsCount = stopsCount.filter(function(e) { return e});

          breaks = ss.jenks(stopsCount,3);

          function getColor(d) {
            return d > breaks[3] ? '#016c59' :
                   d > breaks[2] ? '#1c9099' :
                   d > breaks[1] ? '#67a9cf' :
                   d > breaks[0] ? '#bdc9e1' :
                                   '#f6eff7';
          }

          function style(feature) {
            styleObj = {
              opacity: 1,
              weight: 1,
              color: '#464646',
              fillOpacity: 1,
            };
            if (+feature.properties.Stops == 0) {
              styleObj['fillPattern'] = stripes;
              styleObj['weight'] = 0;
            } else {
              styleObj['fillColor'] = getColor(feature.properties.Stops);
            }
            return styleObj;
          }


          townJSON = L.geoJson(data, {style: style, onEachFeature: townOnEachFeature});
          troopsJSON = L.geoJson(data1, {style: troopStyle, onEachFeature: troopsOnEachFeature});

          var layers = {
            'Municipal Departments': townJSON,
            'State Police Troops': troopsJSON
          };

          var tileLayer = new L.tileLayer("http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
              attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ"
            });
          var map = new L.map('townmap', {zoomControl: false}).setView([41.5013,-72.8325],8);
          stripes.addTo(map);
          tileLayer.addTo(map);
          townJSON.addTo(map);
          L.control.layers(layers).addTo(map);
          map.on('baselayerchange', function (eventLayer) {
            console.log(eventLayer);
            if (eventLayer.name == 'Municipal Departments') {
              this.removeControl(troopLegend);
              townLegend.addTo(map);
            } else {
              this.removeControl(townLegend)
              troopLegend.addTo(map);
            }
          });
          var info = L.control({position: 'topleft'});
          info.onAdd = function (map) {
              this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
              this.update();
              return this._div;
          };

          // method that we will use to update the control based on feature properties passed
          info.update = function (props) {
              this._div.innerHTML = '<h4>Department</h4>' +  (props ?
                  '<b>' + props.Name + '</b><br />' + (+props.Stops).toLocaleString()
                  : 'Hover over a department');
          };
          info.addTo(map);

          var townLegend = L.control({position: 'bottomright'});

          townLegend.onAdd = function (map) {

              var div = L.DomUtil.create('div', 'info legend'),
                  grades = [0]
                  grades = grades.concat(breaks.slice(0,3));

                  labels = [];
              div.innerHTML += '# of Stops<br>';
              // loop through our density intervals and generate a label with a colored square for each interval
              for (var i = 0; i < grades.length; i++) {
                  div.innerHTML +=
                      '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                      grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
              }

              return div;
          };

          townLegend.addTo(map);

          var troopLegend = L.control({position: 'bottomright'});

          troopLegend.onAdd = function (map) {

              var div = L.DomUtil.create('div', 'info legend'),
                  grades = [0]
                  grades = grades.concat(troopBreaks.slice(0,3));

                  labels = [];
              div.innerHTML += '# of Stops<br>';
              // loop through our density intervals and generate a label with a colored square for each interval
              for (var i = 0; i < grades.length; i++) {
                  div.innerHTML +=
                      '<i style="background:' + getTroopColor(grades[i] + 1) + '"></i> ' +
                      grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
              }

              return div;
          };

        });
});

/**
 * scatterPlot - encapsulated, reusable, d3 scatterplot
 * using reusable charts pattern:
 * http://bost.ocks.org/mike/chart/
 */
var scatterPlot = function(data, selection) {
  console.log(selection);
  // Set up the svg space
  var $graphic = $(selection),
      margin = {top:20, left:75, bottom:40, right:20},
      width = $graphic.width() - margin.left - margin.right,
      height = $graphic.height() - margin.top - margin.bottom;

  // var svg = d3.select(selection).selectAll("svg").data(data);
  // svg.enter().append("svg").append("g");

  var svg = d3.select(selection).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // data accessor and mapping functions
  var xValue = function(d) { return d.hr_group;}, // data -> value
    xScatterScale = d3.scale.linear().range([0, width]).domain([0,1]),
    xMap = function(d) { return xScatterScale(xValue(d));}; // data -> display

  var yValue = function(d) { return d.hr_c;}, // data -> value
    yScatterScale = d3.scale.linear().range([height, 0]).domain([0,1]),
    yMap = function(d) { return yScatterScale(yValue(d));}; // data -> display


  // x-,y- axis
  var xAxisScatter = d3.svg.axis()
      .scale(xScatterScale)
      .orient("bottom");

  var yAxisScatter = d3.svg.axis()
    .scale(yScatterScale)
    .orient("left");

  var tooltip = svg.append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

  svg.append("g")
      .attr("class", "x axis")
      .attr("id", "xaxis-scatter")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxisScatter)
      .style("opacity", 1)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .style("text-anchor", "end")
      .style("opacity", 1)
      .style("font-size", "14px")
      .text("Hit Rate - Caucasian");

  // y-axis
  svg.append("g")
      .attr("class", "y axis")
      .attr("id", "yaxis-scatter")
      .call(yAxisScatter)
      .style("opacity", 1)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .style("opacity", 1)
      .style("font-size", "14px")
      .text("Hit Rate - Other");

  var dots = svg.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      // .style("opacity", 1)
      .style("opacity", function(d) {
        p = d.pvalue;
        if (p > 0.1) {
          return 0.3;
        } else {
          return 0.8;
        }})
      .style("fill", function(d) {
        switch (d.Group) {
          case "Hispanic":
            return "#d6616b";
          case "Black":
            return "#9467bd";
          case "Non-caucasian":
            return "#e377c2";
          case "Non-caucasian or Hispanic":
            return "#17becf";
          case "Black or Hispanic":
            return "#2ca02c";
        }
      })
      .attr("r", 3)
      .attr("cx", xMap)
      .attr("cy", yMap)
      .on("mouseover", function(d) {
          radius = this.getAttribute('r');
          tooltip.transition()
               .duration(200)
               .style("opacity", .9);
          tooltip.html(d.Department + "<br/>"
            + "Hit Rate - Caucasian: " + xValue(d).toLocaleString()
            + "<br/>Hit Rate - " + d.Group + ": " + yValue(d).toLocaleString()
            + "<br/>Sample Size: " + d.searches
            + "<br/>P-Value: " + d.pval)
               .style("left", 130 + "px")
               .style("top", 30 + "px");
          d3.select(this).style("stroke", "black").style("stroke-width", 4);
      })
      .on("mouseout", function(d) {
          radius = this.getAttribute('r');
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
          d3.select(this)
            .style("stroke", "black").style("stroke-width", 1);
      });

  var line = svg.append("line")
      .attr("x1", xScatterScale(0))
      .attr("y1", yScatterScale(0))
      .attr("x2", xScatterScale(.82))
      .attr("y2", yScatterScale(.82))
      .attr("class", "bisect")
      .attr("stroke-width",1)
      .attr("stroke", "black")
      .attr("stroke-opacity", 1)
      .attr("stroke-dasharray", ("4, 4"));


  var legendData = ["Non-Caucasian", "Non-Caucasian or Hispanic", "Black", "Hispanic", "Black or Hispanic"];

  var legend = svg.selectAll(".legend")
    .data(legendData)
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")";})
    .style("opacity", 1);

  legend.append("rect")
    .attr("x", width - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", function(d) {
        switch (d) {
          case "Hispanic":
            return "#d6616b";
          case "Black":
            return "#9467bd";
          case "Non-caucasian":
            return "#e377c2";
          case "Non-caucasian or Hispanic":
            return "#17becf";
          case "Black or Hispanic":
            return "#2ca02c";
        }
      })
    .style("fill-opacity", 0.6);

  legend.append("text")
    .attr("x", width - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(function(d) { return d; });

}


function hitRate(data) {
  console.log("loaded Hit Rate");
  console.log(data);
  scatterPlot(data, "#kpt");
}


function vod(data) {
  console.log("loaded VOD");
}

function sortHitrate(a,b) { return b.searches - a.searches; }

function processHitrate(data) {
  data.forEach(function(d) {
    d.pvalue = +d.pval;
    d.searches = +d.searches;
    d.hits = +d.hits;
    d.hr_group = +d.hr_group;
    d.hr_c = +d.hr_c;
  });
  data.sort(sortHitrate);
  return data;
}

d3.csv("static/data/hitrate.csv", function(error1, hitrateData) {
  var scatterData = processHitrate(hitrateData);
  hitRate(scatterData);
});

d3.csv("static/data/vod.csv", function(error2, vodData) {
  vod(vodData);
});
