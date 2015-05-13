/**
 * Scroll Controls, Events, and Setup
 * Inspired (read: forked) from Jim Vallandingham and Mike Freeman
 */

// Freeman Code Fragment
// Set last step height
var height = $('.step:last').height()
var marginBottom = parseInt($('.step:last').css('margin-bottom'))
var newHeight = $(window).height() - height - marginBottom
$('.step:last').height(newHeight)


/**
 * scrollVis - encapsulates
 * all the code for the visualization
 * using reusable charts pattern:
 * http://bost.ocks.org/mike/chart/
 */
var scrollVis = function() {
  // constants to define the size
  // and margins of the vis area.
  var width = 650;
  var height = 520;
  var margin = {top:20, left:30, bottom:40, right:10};

  // Keep track of which visualization
  // we are on and which was the last
  // index activated. When user scrolls
  // quickly, we want to call all the
  // activate functions that they pass.
  var lastIndex = -1;
  var activeIndex = 0;

  // // Sizing for the grid visualization
  // var squareSize = 6;
  // var squarePad = 2;
  // var numPerRow = width / (squareSize + squarePad);

  // main svg used for visualization
  var svg = null;

  // d3 selection that will be used
  // for displaying visualizations
  var g = null;

  // We will set the domain when the
  // data is processed.
  var xCoefficientScale = d3.scale.linear()
    .range([0, width]);

  // The coefficient chart display is horizontal
  // with fixed (5) entities so we can use an
  // ordinal scale to get width and y locations.
  var yCoefficientScale = d3.scale.ordinal()
    .domain([0,1,2,4,5])
    .rangeBands([0, height - 50], 0.1, 0.1);

  // Color is determined just by the index of the bars
  var barColors = {0: "#008080", 1: "#399785", 2: "#5AAF8C"};

  // The scatter plot goes from 0 to 1
  // on both dimensions
  var xValue = function(d) { return d.hr_group;}, // data -> value
    xScatterScale = d3.scale.linear().range([0, width]).domain([0,1]),
    xMap = function(d) { return xScatterScale(xValue(d));}; // data -> display

  var yValue = function(d) { return d.hr_c;}, // data -> value
    yScatterScale = d3.scale.linear().range([height, 0]).domain([0,1]),
    yMap = function(d) { return yScatterScale(yValue(d));}; // data -> display

  // You could probably get fancy and
  // use just one axis, modifying the
  // scale, but I will use two separate
  // ones to keep things easy.

  var xAxisCoefficient = d3.svg.axis()
    .scale(xCoefficientScale)
    .orient("bottom");

  var xAxisScatter = d3.svg.axis()
    .scale(xScatterScale)
    .orient("bottom");
    // .tickFormat(function(d) { return d + " min"; });

  var yAxisScatter = d3.svg.axis()
    .scale(yScatterScale)
    .orient("left");

  // When scrolling to a new section
  // the activation function for that
  // section is called.
  var activateFunctions = [];
  // If a section has an update function
  // then it is called while scrolling
  // through the section with the current
  // progress through the section.
  var updateFunctions = [];

  /**
   * chart
   *
   * @param selection - the current d3 selection(s)
   *  to draw the visualization in. For this
   *  example, we will be drawing it in #vis
   */
  var chart = function(selection) {
    selection.each(function(rawData) {
      // create svg and give it a width and height
      svg = d3.select(this).selectAll("svg").data([rawData]);
      svg.enter().append("svg").append("g");

      svg.attr("width", width + margin.left + margin.right);
      svg.attr("height", height + margin.top + margin.bottom);


      // this group element will be used to contain all
      // other elements.
      g = svg.select("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


      // extract the two datasets
      var hitrateData = rawData['hitRate'];
      var veilData = rawData['veil'];
      // Process each
      var scatterData = processHitrate(hitrateData);

      // get aggregated histogram data
      // var histData = getHistogram(fillerWords);
      // // set histogram's domain
      // var histMax = d3.max(histData, function(d) { return d.y; });
      // yHistScale.domain([0, histMax]);

      setupVis(hitrateData);

      setupSections();

    });
  };


  /**
   * setupVis - creates initial elements for all
   * sections of the visualization.
   *
   * @param wordData - data object for each word.
   * @param fillerCounts - nested data that includes
   *  element for each filler word type.
   * @param histData - binned histogram data
   */
  setupVis = function(scatterplotData) {
    // Hit Rate Scatter Plot


    var tooltip = g.append("div")
        .attr("class", "tooltip")
        .style("opacity", 1);

    g.append("text")
      .attr("class", "title hitRate hitRate-title")
      .attr("x", width / 2)
      .attr("y", 60)
      .text("Hit Rate")
      .attr("opacity", 0);

    // axis
    g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxisScatter)
        .style("opacity", 0)
      .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .style("opacity", 1)
        .text("Hit Rate - Caucasian");

    // y-axis
    g.append("g")
        .attr("class", "y axis")
        .call(yAxisScatter)
        .style("opacity", 0)
      .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .style("opacity", 1)
        .text("Hit Rate - Other");

    var dots = g.selectAll(".dot")
        .data(scatterplotData)
      .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 3)
        // .attr("r", function(d) { return d.hit_nc/4;})
        .attr("cx", xMap)
        .attr("cy", yMap)
        .style("fill", "#1F77B4")
        .style("opacity", 0)
        // .style("stroke-opacity", 0)
        .on("mouseover", function(d) {
            tooltip.transition()
                 .duration(200)
                 .style("opacity", .9);
            tooltip.html(d.Department + "<br/> (" + xValue(d)
              + ", " + yValue(d) + ")")
                 .style("left", (d3.event.pageX + 5) + "px")
                 .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                 .duration(500)
                 .style("opacity", 0);
        });

    var line = g.append("line")
        .attr("x1", xScatterScale(0))
        .attr("y1", yScatterScale(0))
        .attr("x2", xScatterScale(.82))
        .attr("y2", yScatterScale(.82))
        .attr("class", "bisect")
        .attr("stroke-width",1)
        .attr("stroke", "black")
        .attr("stroke-opacity", 0)
        .attr("stroke-dasharray", ("4, 4"));


    var legendData = ["Non-caucasian", "Non-caucasian or Hispanic", "Black", "Hispanic", "Black or Hispanic"];

    var legend = g.selectAll(".legend")
      .data(legendData)
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")";})
      .style("opacity", 0);

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

    var nLegendData = [200, 150, 125];
    var nLookup = {200: 30, 150:20, 125:15};

    var nLegend = g.selectAll(".legend-dot")
      .data(nLegendData)
      .enter().append("g")
      .attr("class", "nLegend")
      .attr("opacity", 0);

    nLegend.append("circle")
      .attr("class", "legend-dot")
      .attr("cx", width-75)
      .attr("cy", function(d) {
        radius = nLookup[d];
        return height-35-radius;
      })
      .attr("r", function(d) {
        return nLookup[d];
      })
      .style("fill", "white")
      .style("stroke-width", 1)
      .style("stroke", "black");

    nLegend.append("line")
      .attr("x1", width - 75)
      .attr("x2", width - 40)
      .attr("y1", function(d) { return height-35-(nLookup[d]*2)})
      .attr("y2", function(d) { return height-35-(nLookup[d]*2)})
      .attr("stroke-width",1)
      .attr("stroke", "black");

    nLegend.append("text")
      .attr("x", width-35)
      .attr("y", function(d) {
        return height-30-(nLookup[d]*2);
      })
      .style("text-anchor", "start")
      .text(function(d) {return "N > " + d;});

    // barchart
    // var bars = g.selectAll(".bar").data(fillerCounts);
    // bars.enter()
    //   .append("rect")
    //   .attr("class", "bar")
    //   .attr("x", 0)
    //   .attr("y", function(d,i) { return yBarScale(i);})
    //   .attr("fill", function(d,i) { return barColors[i]; })
    //   .attr("width", 0)
    //   .attr("height", yBarScale.rangeBand());

    // var barText = g.selectAll(".bar-text").data(fillerCounts);
    // barText.enter()
    //   .append("text")
    //   .attr("class", "bar-text")
    //   .text(function(d) { return d.key + "…"; })
    //   .attr("x", 0)
    //   .attr("dx", 15)
    //   .attr("y", function(d,i) { return yBarScale(i);})
    //   .attr("dy", yBarScale.rangeBand() / 1.2)
    //   .style("font-size", "110px")
    //   .attr("fill", "white")
    //   .attr("opacity", 0);

    // // histogram
    // var hist = g.selectAll(".hist").data(histData);
    // hist.enter().append("rect")
    //   .attr("class", "hist")
    //   .attr("x", function(d) { return xHistScale(d.x); })
    //   .attr("y", height)
    //   .attr("height", 0)
    //   .attr("width", xHistScale(histData[0].dx) - 1)
    //   .attr("fill", barColors[0])
    //   .attr("opacity", 0);

    // // cough title
    // g.append("text")
    //   .attr("class", "sub-title cough cough-title")
    //   .attr("x", width / 2)
    //   .attr("y", 60)
    //   .text("cough")
    //   .attr("opacity", 0);

    // // arrowhead from
    // // http://logogin.blogspot.com/2013/02/d3js-arrowhead-markers.html
    // svg.append("defs").append("marker")
    //   .attr("id", "arrowhead")
    //   .attr("refY", 2)
    //   .attr("markerWidth", 6)
    //   .attr("markerHeight", 4)
    //   .attr("orient", "auto")
    //   .append("path")
    //   .attr("d", "M 0,0 V 4 L6,2 Z");

    // g.append("path")
    //   .attr("class", "cough cough-arrow")
    //   .attr("marker-end", "url(#arrowhead)")
    //   .attr("d", function() {
    //     var line = "M " + ((width / 2) - 10) + " " + 80;
    //     line += " l 0 " + 230;
    //     return line;
    //   })
    //   .attr("opacity", 0);
  };

  /**
   * setupSections - each section is activated
   * by a separate function. Here we associate
   * these functions to the sections based on
   * the section's index.
   *
   */
  setupSections = function() {
    // activateFunctions are called each
    // time the active section changes
    activateFunctions[0] = showTitle;
    activateFunctions[1] = showAxis;
    activateFunctions[2] = addPoints;
    activateFunctions[3] = addBisect;
    activateFunctions[4] = colorPointsRace;
    activateFunctions[5] = opacityPointsSignificant;
    activateFunctions[6] = sizePoints;
    activateFunctions[7] = colorStrokePVal;
    // activateFunctions[7] = showCough;
    // activateFunctions[8] = showHistAll;

    // updateFunctions are called while
    // in a particular section to update
    // the scroll progress in that section.
    // Most sections do not need to be updated
    // for all scrolling and so are set to
    // no-op functions.
    for(var i = 0; i < 9; i++) {
      updateFunctions[i] = function() {};
    }
    updateFunctions[7] = updateCough;
  };

  /**
   * ACTIVATE FUNCTIONS
   *
   * These will be called their
   * section is scrolled to.
   *
   * General pattern is to ensure
   * all content for the current section
   * is transitioned in, while hiding
   * the content for the previous section
   * as well as the next section (as the
   * user may be scrolling up or down).
   *
   */

  /**
   * showTitle - initial title
   *
   * hides: count title
   * (no previous step to hide)
   * shows: intro title
   *
   */
  function showTitle() {
    g.selectAll(".hitRate-title")
      .transition()
      .duration(600)
      .attr("opacity", 1.0);

    d3.selectAll(".axis")
      .transition().duration(0)
      .style("opacity", 0);
  }

  /**
   * showAxis - helper function to
   * display particular xAxis
   *
   * @param axis - the axis to show
   *  (xAxisHist or xAxisBar)
   */
   function showAxis(axis) {
    g.selectAll(".dot")
     .transition()
     .duration(0)
     .style("opacity", 0);

    g.selectAll(".hitRate-title")
      .transition()
      .duration(0)
      .attr("opacity", 0);

    d3.selectAll(".axis")
      .transition().duration(500)
      .style("opacity", 1);

    d3.selectAll(".tooltip")
       .transition()
       .duration(0)
       .style("opacity", 0);
  }

   function addPoints() {
      d3.selectAll(".dot")
        .transition()
        .style("opacity", 0.6)
        .attr("r", 5);

      d3.selectAll(".tooltip")
       .transition()
       .duration(0)
       .style("opacity", 1);

      d3.selectAll(".bisect")
        .transition()
        .style("stroke-opacity", 0);
   }

   function addBisect() {
     d3.selectAll(".bisect").transition().style("stroke-opacity", 1);
     d3.selectAll(".dot").transition().duration(0).style("fill", "#1F77B4");
      d3.selectAll(".legend")
      .transition()
      .style("opacity", 0);
   }


   function colorPointsRace() {
    d3.selectAll(".dot")
      .transition()
      .style("opacity", 0.6)
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
      });
    d3.selectAll(".legend")
      .transition()
      .style("opacity", 1);
   }

   function opacityPointsSignificant() {
    d3.selectAll(".nLegend").attr("opacity",0);
    testDomain = xScatterScale.domain();
    if (testDomain[0] == 0) {
      d3.selectAll(".dot")
        .transition()
        .style("opacity", function(d) {
          p = d.pvalue;
          if (p > 0.1) {
            return 0.1;
          } else {
            return 0.6;
          }
      });
    } else {
      yScatterScale.domain([0,1]);
      xScatterScale.domain([0,1]);
      d3.select(".x.axis").transition().call(xAxisScatter);
      d3.select(".y.axis").transition().call(yAxisScatter);
      d3.selectAll(".dot")
        .transition()
        .attr("cx", xMap)
        .attr("cy", yMap)
        .attr("r", 5)
        .style("opacity", function(d) {
          p = d.pvalue;
          if (p > 0.1) {
            return 0.1;
          } else {
            return 0.6;
          }
      });
    }

   }

   function sizePoints() {
     yScatterScale.domain([0.13,0.55]);
     xScatterScale.domain([0.13,0.55]);
     d3.select(".x.axis").transition().call(xAxisScatter);
     d3.select(".y.axis").transition().call(yAxisScatter);
     d3.selectAll(".nLegend").attr("opacity",1);
     d3.selectAll(".dot")
       .transition()
       .attr("cx", xMap)
       .attr("cy", yMap)
       .attr("r", function(d) {
        n = d.searches;
        p = d.pval
        if (n<125) {
          return 0;
        } else {
          if (p > 0.1) {
            return 0;
          } else {
              // console.log(n);
              if (n>200) {
                return 30;
              } else if (n>150) {
                return 20;
              } else {
                return 15;
              }
          }
        }
      });
   }

   function colorStrokePVal() {
     d3.selectAll(".dot")
       .transition()
       // .style("stroke-opacity",function(d) {
       //    p = d.pvalue;
       //    if (p > 0.1) {
       //      return 0;
       //    } else {
       //      return 0.8;
       //    }
       //  })
       // .style("stroke-width", function(d) {
       //  p = d.pvalue;
       //  if (p > 0.1) {
       //    return 0;
       //  } else {
       //    return 3;
       //  }
       // })
       // .style("stroke", function(d) {
       //    p = d.pvalue;
       //    if (p > 0.1) {
       //      return "#bdbdbd";
       //    } else {
       //        if (p > .05) {
       //          return "#e34a33";
       //        } else if (p > .01) {
       //          return "#e7ba52";
       //        } else {
       //          return "#3182bd";
       //        }
       //    }
       //  });
   }

  /**
   * showGrid - square grid
   *
   * hides: filler count title
   * hides: filler highlight in grid
   * shows: square grid
   *
   */
  function showGrid() {
    g.selectAll(".count-title")
      .transition()
      .duration(0)
      .attr("opacity", 0);

    g.selectAll(".square")
      .transition()
      .duration(600)
      .delay(function(d,i) {
        return 5 * d.row;
      })
      .attr("opacity", 1.0)
      .attr("fill", "#ddd");
  }

  /**
   * highlightGrid - show fillers in grid
   *
   * hides: barchart, text and axis
   * shows: square grid and highlighted
   *  filler words. also ensures squares
   *  are moved back to their place in the grid
   */
  function highlightGrid() {
    hideAxis();
    g.selectAll(".bar")
      .transition()
      .duration(600)
      .attr("width", 0);

    g.selectAll(".bar-text")
      .transition()
      .duration(0)
      .attr("opacity", 0);


    g.selectAll(".square")
      .transition()
      .duration(0)
      .attr("opacity", 1.0)
      .attr("fill", "#ddd");

    // use named transition to ensure
    // move happens even if other
    // transitions are interrupted.
    g.selectAll(".fill-square")
      .transition("move-fills")
      .duration(800)
      .attr("x", function(d,i) {
        return d.x;
      })
      .attr("y", function(d,i) {
        return d.y;
      });

    g.selectAll(".fill-square")
      .transition()
      .duration(800)
      .attr("opacity", 1.0)
      .attr("fill", function(d) { return d.filler ? '#008080' : '#ddd'; });
  }

  /**
   * showBar - barchart
   *
   * hides: square grid
   * hides: histogram
   * shows: barchart
   *
   */
  function showBar() {
    // ensure bar axis is set
    showAxis(xAxisBar);

    g.selectAll(".square")
      .transition()
      .duration(800)
      .attr("opacity", 0);

    g.selectAll(".fill-square")
      .transition()
      .duration(800)
      .attr("x", 0)
      .attr("y", function(d,i) {
        return yBarScale(i % 3) + yBarScale.rangeBand() / 2;
      })
      .transition()
      .duration(0)
      .attr("opacity", 0);

    g.selectAll(".hist")
      .transition()
      .duration(600)
      .attr("height", function(d) { return  0; })
      .attr("y", function(d) { return  height; })
      .style("opacity", 0);

    g.selectAll(".bar")
      .transition()
      .delay(function(d,i) { return 300 * (i + 1);})
      .duration(600)
      .attr("width", function(d) { return xBarScale(d.values); });

    g.selectAll(".bar-text")
      .transition()
      .duration(600)
      .delay(1200)
      .attr("opacity", 1);
  }

  /**
   * showHistPart - shows the first part
   *  of the histogram of filler words
   *
   * hides: barchart
   * hides: last half of histogram
   * shows: first half of histogram
   *
   */
  function showHistPart() {
    // switch the axis to histogram one
    showAxis(xAxisHist);

    g.selectAll(".bar-text")
      .transition()
      .duration(0)
      .attr("opacity", 0);

    g.selectAll(".bar")
      .transition()
      .duration(600)
      .attr("width", 0);

    // here we only show a bar if
    // it is before the 15 minute mark
    g.selectAll(".hist")
      .transition()
      .duration(600)
      .attr("y", function(d) { return (d.x < 15) ? yHistScale(d.y) : height; })
      .attr("height", function(d) { return (d.x < 15) ? height - yHistScale(d.y) : 0;  })
      .style("opacity", function(d,i) { return (d.x < 15) ? 1.0 : 1e-6; });
  }

  /**
   * showHistAll - show all histogram
   *
   * hides: cough title and color
   * (previous step is also part of the
   *  histogram, so we don't have to hide
   *  that)
   * shows: all histogram bars
   *
   */
  function showHistAll() {
    // ensure the axis to histogram one
    showAxis(xAxisHist);

    g.selectAll(".cough")
      .transition()
      .duration(0)
      .attr("opacity", 0);

    // named transition to ensure
    // color change is not clobbered
    g.selectAll(".hist")
      .transition("color")
      .duration(500)
      .style("fill", "#008080");

    g.selectAll(".hist")
      .transition()
      .duration(1200)
      .attr("y", function(d) { return yHistScale(d.y); })
      .attr("height", function(d) { return  height - yHistScale(d.y);  })
      .style("opacity", 1.0);
  }

  /**
   * showCough
   *
   * hides: nothing
   * (previous and next sections are histograms
   *  so we don't have to hide much here)
   * shows: histogram
   *
   */
  function showCough() {
    // ensure the axis to histogram one
    showAxis(xAxisHist);

    g.selectAll(".hist")
      .transition()
      .duration(600)
      .attr("y", function(d) { return yHistScale(d.y); })
      .attr("height", function(d) { return  height - yHistScale(d.y);  })
      .style("opacity", 1.0);
  }


  /**
   * hideAxis - helper function
   * to hide the axis
   *
   */
  function hideAxis() {
    g.select(".x.axis")
      .transition().duration(500)
      .style("opacity",0);
  }

  /**
   * UPDATE FUNCTIONS
   *
   * These will be called within a section
   * as the user scrolls through it.
   *
   * We use an immediate transition to
   * update visual elements based on
   * how far the user has scrolled
   *
   */

  /**
   * updateCough - increase/decrease
   * cough text and color
   *
   * @param progress - 0.0 - 1.0 -
   *  how far user has scrolled in section
   */
  function updateCough(progress) {
    g.selectAll(".cough")
      .transition()
      .duration(0)
      .attr("opacity", progress);

    g.selectAll(".hist")
      .transition("cough")
      .duration(0)
      .style("fill", function(d,i) {
        return (d.x >= 14) ? coughColorScale(progress) : "#008080";
      });
  }

  /**
   * DATA FUNCTIONS
   *
   * Used to coerce the data into the
   * formats we need to visualize
   *
   */

 /**
  * processHitrate - converts strings
  * back to numbers. also sort by search
  * in order to get z index correct
  * @parem data - raw data from csv
  */

  function sortHitrate(a,b) {
    return b.searches - a.searches;
  }

  function processHitrate(data) {
    data.forEach(function(d) {
      d.pvalue = +d.pval;
      d.searches = +d.searches;
      d.hits = +d.hits;
      d.hr_group = +d.hr_group;
      d.hr_c = +d.hr_c;
    });
    data.sort(sortHitrate);
    console.log(data);
    return data;
  }


  /**
   * activate -
   *
   * @param index - index of the activated section
   */
  chart.activate = function(index) {
    activeIndex = index;
    var sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
    var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolledSections.forEach(function(i) {
      activateFunctions[i]();
    });
    lastIndex = activeIndex;
  };

  /**
   * update
   *
   * @param index
   * @param progress
   */
  chart.update = function(index, progress) {
    updateFunctions[index](progress);
  };

  // return chart function
  return chart;
};


/**
 * display - called once data
 * has been loaded.
 * sets up the scroller and
 * displays the visualization.
 *
 * @param data - loaded tsv data
 */
function display(data) {
  // create a new plot and
  // display it
  var plot = scrollVis();
  d3.select("#vis")
    .datum(data)
    .call(plot);

  // setup scroll functionality
  var scroll = scroller()
    .container(d3.select('#graphic'));

  // pass in .step selection as the steps
  scroll(d3.selectAll('.step'));

  // setup event handling
  scroll.on('active', function(index) {
    // highlight current step text
    d3.selectAll('.step')
      .style('opacity',  function(d,i) { return i == index ? 1 : 0.1; });

    // activate current section
    plot.activate(index);
  });

  scroll.on('progress', function(index, progress){
    plot.update(index, progress);
  });
}

d3.csv("static/data/hitrate.csv", function(error1, data1) {
  d3.csv("static/data/vod.csv", function(error2, data2) {
    data = {'hitRate': data1, 'veil': data2};
    console.log(data2);
    display(data);
  });
});
