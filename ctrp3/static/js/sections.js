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
var test;
var vod = false;

/**
 * setupSlides -
 * simple setup of slides as driven by NPR Style CSV CMS
 */

var setupSlides = function(data) {
    var index = 1;
    var sections = d3.select("#sections");
    data.forEach(function(s) {
      sectionID = "#sidebar-" + index;
      index++;
      var section = sections.append("section").attr("class", "step");
      var slide = section.append("div").attr("id", sectionID);
      slide.append("div").attr("class","title").text(s.SidebarHeader);
      slide.append("p").attr("class", "s1").html(s.S1);
      slide.append("p").attr("class", "s2").html(s.S2);
      slide.append("p").attr("class", "s3").html(s.S3);
      slide.append("p").attr("class", "s4").html(s.S4);
      slide.append("p").attr("class", "s5").html(s.S5);
    });
  }

/**
 * scrollVis - encapsulates
 * all the code for the visualization
 * using reusable charts pattern:
 * http://bost.ocks.org/mike/chart/
 */
var scrollVis = function() {
  // constants to define the size
  // and margins of the vis area.
  var $graphic = $("#vis");

  var margin = {top:20, left:75, bottom:40, right:20};
  var width = $graphic.width() - margin.left - margin.right;
  var height = $graphic.height() - margin.top - margin.bottom;
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
  var yCoefficientScale0 = d3.scale.ordinal()
    .rangeRoundBands([0, height], 0.1);

  var yCoefficientScale1 = d3.scale.ordinal();

  var color = d3.scale.ordinal()
    .range(["#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c"]);

  // Color is determined just by the index of the bars
  // var barColors = {0: "#008080", 1: "#399785", 2: "#5AAF8C"};

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

  var yAxisCoefficient = d3.svg.axis()
    .scale(yCoefficientScale0)
    .orient("left");

  // When scrolling to a new section
  // the activation function for that
  // section is called.
  var activateFunctions = [];
  var functionDictionary = {};
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
      var slideData = rawData['slides'];
      // Process each
      var scatterData = processHitrate(hitrateData);
      var vodData = processVOD(veilData);

      setupVis(hitrateData, vodData, slideData);
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
  setupVis = function(scatterplotData, vodData, slides) {

    var visBox = d3.select("#vis");

    // Hit Rate Scatter Plot
    var tooltip = visBox.append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var vodTooltip = visBox.append("div")
        .attr("class", "tooltip")
        .attr("id", "vodTooltip")
        .style("opacity", 0);

    // Slide 0 - showQuote
    var quote = visBox.append("div")
     .attr("class", "slide")
     .attr("id", "quote-slide")
     .style("visibility", "hidden");

     quote.append("p")
      .attr("class", "title quote")
      .html(slides[0].P1);

     quote.append("p")
      .attr("class", "title attribution")
      .html(slides[0].P2);

    // Slide 1 - showIntro1
    var intro1 = visBox.append("div")
      .attr("class", "slide")
      .attr("id", "intro1")
      .style("visibility", "hidden");

    intro1.append("p")
      .attr("class", "text")
      .html(slides[1].P1);

    intro1.append("p")
      .attr("class", "text")
      .html(slides[1].P2);

    intro1.append("p")
      .attr("class", "text")
      .html(slides[1].P3);

    intro1.append("p")
      .attr("class", "text")
      .html(slides[1].P4);

    // Slide 2 showIntro2
    var intro2 = visBox.append("div")
     .attr("class", "slide")
     .attr("id", "intro2")
     .style("visibility", "hidden");

    intro2.append("p")
      .attr("class", "text")
      .html(slides[2].P1);

    intro2.append("p")
      .attr("class", "text")
      .html(slides[2].P2);

    // Slide 3 - showInterpretationProblems

    var methodBackground = visBox.append("div")
      .attr("class", "slide")
      .attr("id", "method-background")
      .style("visibility", "hidden");

    methodBackground.append("p")
      .attr("class", "text")
      .html(slides[3].P1)
      .attr("opacity", 0);

    methodBackground.append("p")
      .attr("class", "text")
      .html(slides[3].P2)
      .attr("opacity", 0);

    // Slide 4 - showAnalysis

    var analysisHeader = visBox.append("div")
      .attr("class", "slide-header")
      .attr("id", "analysis-header")
      .style("visibility", "hidden");

    analysisHeader.append("h2")
      .html(slides[4].BoxHeader)
      .attr("opacity", 0);

    var analysis = visBox.append("div")
      .attr("class", "slide")
      .attr("id", "analysis")
      .style("visibility", "hidden");

    analysis.append("p")
      .attr("class", "text")
      .html(slides[4].P1)
      .attr("opacity", 0);

    analysis.append("p")
      .attr("class", "text")
      .html(slides[4].P2)
      .attr("opacity", 0);

    analysis.append("p")
      .attr("class", "text")
      .html(slides[4].P3)
      .attr("opacity", 0);

    analysis.append("p")
      .attr("class", "text")
      .html(slides[4].P4)
      .attr("opacity", 0);

    analysis.append("p")
      .attr("class", "text")
      .html(slides[4].P5)
      .attr("opacity", 0);

    // slide 5 - showMethodology

    var methodologyHeader = visBox.append("div")
      .attr("class", "slide-header")
      .attr("id", "methodology-header")
      .style("visibility", "hidden");

    methodologyHeader.append("h2")
      .html(slides[5].BoxHeader)
      .attr("opacity", 0);

    var methodology = visBox.append("div")
      .attr("class", "slide")
      .attr("id", "methodology")
      .style("visibility", "hidden");

    methodology.append("p")
      .attr("class", "text")
      .html(slides[5].P1)
      .attr("opacity", 1);

    methodology.append("p")
      .attr("class", "text")
      .html(slides[5].P2)
      .attr("opacity", 1);

    methodology.append("p")
      .attr("class", "text")
      .html(slides[5].P3)
      .attr("opacity", 1);

    // slide 10 - showVODExplain
    var vod = visBox.append("div")
      .attr("class", "slide")
      .attr("id", "vod-slide")
      .style("visibility", "hidden");

    vod.append("p")
      .attr("class", "text")
      .html(slides[10].P1)
      .attr("opacity", 1);

    vod.append("p")
      .attr("class", "text")
      .html(slides[10].P2)
      .attr("opacity", 1);

    // axis
    g.append("g")
        .attr("class", "x axis")
        .attr("id", "xaxis-scatter")
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
        .attr("id", "yaxis-scatter")
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


    var legendData = ["Non-Caucasian", "Non-Caucasian or Hispanic", "Black", "Hispanic", "Black or Hispanic"];

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

    var vodLegend = g.selectAll(".vod-legend")
      .data(legendData)
      .enter().append("g")
      .attr("class", "vod-legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")";})
      .style("opacity", 0);

    vodLegend.append("rect")
      .attr("x", width - 18)
      .attr("y", height - 150)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", function(d) {
          return color(d);
        })
      .style("fill-opacity", 1);

    vodLegend.append("text")
      .attr("x", width - 24)
      .attr("y", height - 150 + 9)
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



    // slide 4 header
    var addPointsHeader = visBox.append("div")
      .attr("class", "slide-header")
      .attr("id", "addPoints-header")
      .style("visibility", "hidden");

    addPointsHeader.append("h3")
      .html(slides[4].BoxHeader)
      .attr("class", "header-white")

    // slide 10 Header
    var revealPointsVODheader = visBox.append("div")
      .attr("class", "slide-header")
      .attr("id", "revealPointsVOD-header")
      .style("visibility", "hidden");

    revealPointsVODheader.append("h3")
      .html(slides[10].BoxHeader)
      .attr("class", "header-white")
      .attr("opacity", 0);


    // slide 11 Header
    var movePointsVODheader = visBox.append("div")
      .attr("class", "slide-header")
      .attr("id", "movePointsVOD-header")
      .style("visibility", "hidden");

    movePointsVODheader.append("h3")
      .html(slides[11].BoxHeader)
      .attr("class", "header-white")
      .attr("opacity", 0);

    // Veil of Darkness

    var groupNames = vodData[0].values.map(function(g) { return g.key;});

    yCoefficientScale0.domain(vodData.map(function(o) { return o.key;}));

    // we will substract 30 here to tighten up the distribution, making it easier to see where
    // towns split
    yCoefficientScale1.domain(groupNames).rangeRoundBands([0, yCoefficientScale0.rangeBand()-30]);
    xCoefficientScale.domain([
      d3.min(vodData, function(g) { return d3.min(g.values, function(r) {
        return (r.values[0].Coefficient + r.values[0].SE);
      });})-0.25,
      d3.max(vodData, function(g) { return d3.max(g.values, function(r) {
        return (r.values[0].Coefficient - r.values[0].SE);
      });})+0.25
      ]);

    g.append("g")
        .attr("class", "x axis")
        .attr("id", "xaxis-coeff")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxisCoefficient)
        .style("opacity", 0)
      .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .style("opacity", 1)
        .text("Coefficient");

    // y-axis
    g.append("g")
        .attr("class", "y axis")
        .attr("id", "yaxis-coeff")
        .call(yAxisCoefficient)
        .style("opacity", 0)
      .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .style("opacity", 0)
        .text("Department");

    var coeffPoints = g.selectAll(".department")
      .data(vodData)
      .enter().append("g")
      .attr("class", "g")
      .attr("transform", function(d) { return "translate(0," + yCoefficientScale0(d.key) + ")";});

    // We adjusted the domain of the y scale 1 above (decresed by 30)
    // Here we will tweak the cy position to center points around the center of
    // the band

    coeffPoints.selectAll("line")
      .data(function(d) { return d.values;})
      .enter().append("line")
      .attr("class", "errorBars")
      .attr("y1", function(d) { return yCoefficientScale1(d.key)+15;})
      .attr("y2", function(d) { return yCoefficientScale1(d.key)+15;})
      .attr("x1", function (d) { return xCoefficientScale(d.values[0].Coefficient-d.values[0].SE)})
      .attr("x2", function (d) { return xCoefficientScale(d.values[0].Coefficient+d.values[0].SE)})
      .attr("stroke-width",0.5)
      .attr("stroke", "black")
      .style("opacity", 0);

    coeffPoints.selectAll("circle")
      .data(function(d) { return d.values;})
      .enter().append("circle")
      .attr("class", "coeffPoints")
      .attr("r",5)
      .attr("cx", function(d) { return xCoefficientScale(0);})
      .attr("cy", function(d,i) { return yCoefficientScale1(d.key)+15;})
      .style("fill", "#1F77B4")
      .style("opacity", 0);
  };

  /**
   * setupSections - each section is activated
   * by a separate function. Here we associate
   * these functions to the sections based on
   * the section's index.
   *
   */
  setupSections = function(fA,fD) {
    // activateFunctions are called each
    // time the active section changes
    for (i = 0; i < fA.length; i++) {
      activateFunctions[i] = fD[fA[i]];
    }
    // console.log(activateFunctions);

    // updateFunctions are called while
    // in a particular section to update
    // the scroll progress in that section.
    // Most sections do not need to be updated
    // for all scrolling and so are set to
    // no-op functions.
    for(var i = 0; i < fA.length; i++) {
      updateFunctions[i] = function() {};
    }
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

   function showQuote() {
      d3.selectAll(".slide").transition().duration(0).style("visibility", "hidden");
      d3.select("#quote-slide").transition().style("visibility", "visible");
      d3.select("#vis").transition().attr("class", "well well-lg photo");
   }
   functionDictionary['showQuote'] = showQuote;

   function showIntro1() {
      d3.select("#quote-slide").transition().duration(0).style("visibility", "visible");
      d3.select("#vis").transition().duration(0).attr("class", "well well-lg photo");
   }
   functionDictionary['showIntro1'] = showIntro1;

   function showIntro2() {
      d3.select("#vis").transition().duration(0).attr("class", "well well-lg");
      d3.selectAll(".slide").transition().duration(0).style("visibility", "hidden");
      d3.selectAll(".slide-header").transition().duration(0).style("visibility", "hidden");
      d3.select("#intro2").transition().style("visibility", "visible");
   }
   functionDictionary['showIntro2'] = showIntro2;

   function showInterpretationProblems() {
    d3.selectAll(".dot").transition().duration(0).style("opacity", 0);
    d3.selectAll(".bisect").transition().duration(0).style("stroke-opacity", 0);
    d3.selectAll("#xaxis-scatter").transition().duration(0).style("opacity", 0);
    d3.selectAll("#yaxis-scatter").transition().duration(0).style("opacity", 0);
    d3.selectAll(".slide-header").transition().duration(0).style("visibility", "hidden");
    d3.selectAll(".slide").transition().duration(0).style("visibility", "hidden");
    d3.select("#method-background").transition().style("visibility", "visible");
   }
   functionDictionary['showInterpretationProblems'] = showInterpretationProblems;

   // function showAnalysis() {
   //    d3.selectAll(".slide").transition().duration(0).style("visibility", "hidden");
   //    d3.selectAll(".slide-header").transition().duration(0).style("visibility", "hidden");
   //    d3.select("#analysis").transition().style("visibility", "visible");
   //    d3.select("#analysis-header").transition().style("visibility", "visible");
   // }
   // functionDictionary['showAnalysis'] = showAnalysis;

   // function showMethodology() {
   //  d3.selectAll(".slide-header").transition().duration(0).style("visibility", "hidden");
   //  d3.selectAll(".slide").transition().duration(0).style("visibility", "hidden");
   //  d3.selectAll(".dot").transition().duration(0).style("opacity", 0);
   //  d3.selectAll(".bisect").transition().duration(0).style("stroke-opacity", 0);
   //  d3.selectAll("#xaxis-scatter").transition().duration(0).style("opacity", 0);
   //  d3.selectAll("#yaxis-scatter").transition().duration(0).style("opacity", 0);
   //  d3.select("#vis").transition().duration(0).attr("class", "well well-lg photo");
   //  d3.select("#methodology").transition().style("visibility", "visible");
   //  d3.select("#methodology-header").transition().style("visibility", "visible");
   // }
   // functionDictionary['showMethodology'] = showMethodology;

  /**
   * showAxis - helper function to
   * display particular xAxis
   *
   * @param axis - the axis to show
   *  (xAxisHist or xAxisBar)
   */
   function addPoints() {
      d3.selectAll(".slide-header").transition().duration(0).style("visibility", "hidden");
      d3.select("#addPoints-header").transition().style("visibility", "visible");
      d3.select("#vis").transition().attr("class", "well well-lg");
      d3.selectAll(".slide").transition().duration(0).style("visibility", "hidden");

      d3.selectAll(".dot")
        .transition()
        .style("opacity", 0.6)
        .style("fill", "#1F77B4")
        .attr("r", 5);

      d3.selectAll(".tooltip")
       .transition()
       .duration(0)
       .style("opacity", 1);

      d3.selectAll(".bisect")
        .transition()
        .duration(0)
        .style("stroke-opacity", 0);

      d3.selectAll("#xaxis-scatter")
        .transition().duration(500)
        .style("opacity", 1);

      d3.selectAll("#yaxis-scatter")
        .transition().duration(500)
        .style("opacity", 1);

      d3.selectAll(".tooltip")
         .transition()
         .duration(0)
         .style("opacity", 0);
   }
   functionDictionary['addPoints'] = addPoints;

   function addBisect() {
     d3.selectAll(".bisect").transition().style("stroke-opacity", 1);
     d3.selectAll(".dot").transition().duration(0).style("fill", "#1F77B4");
     d3.selectAll(".legend")
      .transition()
      .duration(0)
      .style("opacity", 0);
   }
   functionDictionary['addBisect'] = addBisect;

   function colorPointsRace() {
      d3.selectAll(".slide-header").transition().duration(0).style("visibility", "hidden");
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
   functionDictionary['colorPointsRace'] = colorPointsRace;

   function opacityPointsSignificant() {
      d3.selectAll(".nLegend").transition().duration(0).style("opacity",0);
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
        d3.selectAll(".nLegend").transition().duration(0).style("opacity",0);
        d3.select("#xaxis-scatter").transition().duration(0).call(xAxisScatter);
        d3.select("#yaxis-scatter").transition().duration(0).call(yAxisScatter);
        d3.selectAll(".dot")
          .transition().duration(0)
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
   functionDictionary['opacityPointsSignificant'] = opacityPointsSignificant;

   function sizePoints() {
     var tooltip = d3.select(".tooltip");
     d3.selectAll(".dot")
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
     yScatterScale.domain([0.13,0.55]);
     xScatterScale.domain([0.13,0.55]);
     d3.select("#xaxis-scatter").transition().duration(0).call(xAxisScatter);
     d3.select("#yaxis-scatter").transition().duration(0).call(yAxisScatter);
     d3.selectAll(".nLegend").transition().duration(0).style("opacity",1);
     d3.selectAll(".legend")
        .transition()
        .duration(0)
        .style("opacity", 1);
      d3.selectAll(".bisect").transition().duration(0).style("stroke-opacity", 1);
     if (vod) {
      vod = false;
      d3.select("#xaxis-coeff").transition().duration(0).style("opacity",0);
      d3.select("#yaxis-coeff").transition().duration(0).style("opacity",0);
      d3.select("#xaxis-scatter").transition().duration(0).style("opacity",1);
      d3.select("#yaxis-scatter").transition().duration(0).style("opacity",1);
     } else {}
       d3.selectAll(".dot")
         .transition()
         .attr("cx", xMap)
         .attr("cy", yMap)
         .style("opacity", function(d) {
           p = d.pvalue;
           if (p > 0.1) {
             return 0.1;
           } else {
             return 0.6;
           }})
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
   functionDictionary['sizePoints'] = sizePoints;

   function showVODExplain() {
      d3.selectAll(".dot")
        .on("mouseover", function(d) {})
        .on("mouseout", function(d) {});
      vod = true;
      d3.select("#vis").transition().attr("class", "well well-lg");
      d3.select("#points-header").transition().duration(0).style("visibility", "hidden");
      d3.selectAll(".dot").transition().duration(0).style("opacity",0);
      d3.selectAll(".axis").transition().duration(0).style("opacity",0);
      d3.selectAll(".nLegend").transition().duration(0).style("opacity",0);
      d3.selectAll(".legend").transition().duration(0).style("opacity",0);
      d3.selectAll(".bisect").transition().duration(0).style("stroke-opacity",0);
      d3.selectAll(".coeffPoints")
       .transition().duration(0)
       .style("opacity",0);
      d3.selectAll("#xaxis-coeff").transition().duration(0).style("opacity",0);
      d3.selectAll("#yaxis-coeff").transition().duration(0).style("opacity",0);
      d3.selectAll(".vod-legend").transition().duration(0).style("opacity",0);
      d3.select("#vod-slide").transition().style("visibility", "visible");
   }
   functionDictionary['showVODExplain'] = showVODExplain;

   // function transitionKPTtoVOD() {
   //    d3.selectAll(".slide").transition().duration(0).style("visibility", "hidden");
   //    vod = true;
   //    d3.selectAll(".dot").transition().duration(0).style("opacity",0);
   //    d3.selectAll(".axis").transition().duration(0).style("opacity",0);
   //    d3.selectAll(".nLegend").transition().duration(0).style("opacity",0);
   //    d3.selectAll(".legend").transition().duration(0).style("opacity",0);
   //    d3.selectAll(".bisect").transition().duration(0).style("stroke-opacity",0);
   //    d3.selectAll(".coeffPoints")
   //     .transition().duration(0)
   //     .style("opacity",0);
   //    d3.selectAll("#xaxis-coeff").transition().duration(0).style("opacity",0);
   //    d3.selectAll("#yaxis-coeff").transition().duration(0).style("opacity",0);
   // }
   // functionDictionary['transitionKPTtoVOD'] = transitionKPTtoVOD;

   function revealPointsVOD() {
      var vodTooltip = d3.select("#vodTooltip");
      d3.selectAll(".slide").transition().duration(0).style("visibility", "hidden");
      d3.selectAll(".slide-header").transition().duration(0).style("visibility", "hidden");
      d3.select("#revealPointsVOD-header").transition().style("visibility", "visible");
      d3.selectAll("#xaxis-coeff").transition().style("opacity",1);
      d3.selectAll("#yaxis-coeff").transition().style("opacity",1);
      d3.selectAll(".vod-legend").transition().style("opacity",1);
      d3.selectAll(".coeffPoints")
       .on("mouseover", function(d) {
            ddata = d.values[0];
            vodTooltip.transition()
                 .duration(200)
                 .style("opacity", .9);
            vodTooltip.html(ddata.Department
              + "<br/>Subgroup: " + ddata.Variable
              + "<br/>Coefficient: " + ddata.Coefficient + ", P-Value: " + ddata.P
              + "<br/>Sample Size: " + ddata.N);
            d3.select(this).style("stroke", "black").style("stroke-width", 4);
        })
       .on("mouseout", function(d) {
           vodTooltip.transition()
                .duration(500)
                .style("opacity", 0);
           d3.select(this)
             .style("stroke", "black").style("stroke-width", 1);
       })
       .transition()
       .attr("cx", function(d) { return xCoefficientScale(0);})
       .style("opacity",1)
       .style("fill", function(d) { return color(d.values[0].Variable)});

   }
   functionDictionary['revealPointsVOD'] = revealPointsVOD;

   function movePointsVOD() {
      d3.selectAll(".slide").transition().duration(0).style("visibility", "hidden");
      d3.selectAll(".slide-header").transition().duration(0).style("visibility", "hidden");
      d3.select("#movePointsVOD-header").transition().style("visibility", "visible");
      d3.selectAll(".coeffPoints")
       .transition().duration(0)
       .attr("r", 5)
       .transition().duration(500)
       .attr("cx", function(d) { return xCoefficientScale(d.values[0].Coefficient);});
   }
   functionDictionary['movePointsVOD'] = movePointsVOD;

   function sizePointsVOD() {
      d3.selectAll("line.errorBars")
       .transition().duration(0)
       .style("opacity", 0);
      d3.selectAll(".coeffPoints")
       .transition().duration(500)
       .attr("r", function(d) {
        n = d.values[0].N;
        if (n > 8000) {
          return 9;
        } else if (n > 4000) {
          return 7;
        } else if (n > 1000) {
          return 5;
        } else if (n > 200) {
          return 3;
        }
       });
   }
   functionDictionary['sizePointsVOD'] = sizePointsVOD;

   function addErrorBarsVOD() {
      d3.selectAll("line.errorBars")
       .transition().duration(500)
       .style("opacity", 1);
   }
   functionDictionary['addErrorBarsVOD'] = addErrorBarsVOD;

   function showConclusion() {

   }
   functionDictionary['showConclusion'] = showConclusion;
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

  function processVOD(data) {
    test = data;
    data.forEach(function(d) {
      d.Coefficient = +d.Coefficient;
      d.P = +d.P;
      d.SE = +d.SE;
      d.N = +d.N;
    })
    var nestedData = d3.nest().key(function(d) { return d.Department;}).key(function(d) { return d.Variable;}).entries(test);
    test = nestedData;
    return nestedData;
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

  chart.initiateSections = function(fa) {
    console.log(functionDictionary);
    setupSections(fa, functionDictionary);
  }
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

  functionArray = data['functionArray'];
  // create a new plot and
  // display it
  var plot = scrollVis();
  d3.select("#vis")
    .datum(data)
    .call(plot);

  plot.initiateSections(functionArray);
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
    d3.csv("static/data/narrative.csv", function(error3, data3) {
      functionArray = data3.map(function(s) { return s.functions});
      data = {'hitRate': data1, 'veil': data2, 'slides': data3, 'functionArray': functionArray};
      setupSlides(data3);
      display(data);
    })
  });
});
