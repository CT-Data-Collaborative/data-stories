
var data, maxp, fdat, mdat, y, x1, x2, label, vis, rTransform, lTransform, div;
var goTo, linkClass, tooltipText, isYear, play, barWidth, fb, ctls, rules1, rules2;

var pyrStop = true;
var pyrYears = [2000, 2010, 2020, 2030, 2040];
var vizHeight = d3.max([window.innerHeight * .6, (18*20+100)]);
var vizWidth = d3.max([window.innerWidth * .25, 250]);
var w = vizWidth,
    h = vizHeight,
    bins = d3.range(18),
    labelbins = bins.filter(function(d) {
        return d % 2 === 0;
    });
year = 2000,
    rf = "javascript:return false;";
d3.csv('static/data/longpyramid.csv', function(pyr) {
    data = pyr.map(function(d) {
        return {
            year: +d.year,
            age: +d.age,
            sex: +d.sex,
            people: +d.people
        }
    });
    maxp = data.reduce(function(a, b) {
            return Math.max(a, b.people);
        }, 0),
        mdat = data.filter(function(d) {
            return d.sex == 1;
        })
        .sort(function(a, b) {
            return b.age - a.age;
        }),
        fdat = data.filter(function(d) {
            return d.sex == 2;
        })
        .sort(function(a, b) {
            return b.age - a.age;
        });
    y = d3.scale.ordinal()
        .domain(bins)
        .rangeBands([0, h], 0.25),
        x1 = d3.scale.linear()
        .domain([0, maxp])
        .range([0, w]),
        x2 = d3.scale.linear()
        .domain([0, maxp])
        .range([w, 0]);
    drawPyramid();
});

    function showPyrStop() {
      $("#pyrPlay").hide();
      $("#pyrStop").show();
    }

    function showPyrPlay() {
      $("#pyrStop").hide();
      $("#pyrPlay").show();
    }

    function runpyrLoop() {
      setTimeout(pyrLoop, 1500);
    }

    function pyrLoop() {
      if(pyrStop)
        return false;
      currentYearIndex = pyrYears.indexOf(year);
      if (currentYearIndex == (pyrYears.length-1)) {
        year = pyrYears[0];
      } else {
        year = pyrYears[currentYearIndex+1];
      }
      goTo(year);
      runpyrLoop();
    }

    goTo = function(yr, dur) {
        dur = dur || 300;
        var old = year;
        year = yr;
        label.text(year);
        div.selectAll("span.link a")
            .attr("class", linkClass);
        fb = vis.selectAll("rect.female")
            .data(fdat.filter(isYear));
        fb.enter().append("svg:rect")
            .attr("id", function(d) {
                return "f" + (d.year - d.age);
            })
            .attr("class", "female")
            .attr("fill", "pink")
            .attr("transform", lTransform)
            .attr("width", function(d) {
                return x1(d.people);
            })
            .attr("y", yr > old ? 20 : -20)
            .attr("height", y.rangeBand())
            .attr("opacity", 0.0001)
            .transition()
            .duration(dur)
            .attr("y", 0)
            .attr("opacity", 1);
        fb.exit()
            .transition()
            .duration(dur)
            .attr("y", yr > old ? -20 : 30)
            .attr("opacity", 0.0001)
            .each("end", function() {
                d3.select(this)
                    .remove();
            });
        fb.transition()
            .duration(dur)
            .attr("transform", lTransform)
            .attr("y", 0)
            .attr("width", function(d) {
                return x1(d.people);
            })
            .attr("opacity", 1);
        fb.selectAll("title")
            .text(tooltipText);
        var mb = vis.selectAll("rect.male")
            .data(mdat.filter(isYear));
        mb.enter()
            .append("svg:rect")
            .attr("id", function(d) {
                return "m" + (d.year - d.age);
            })
            .attr("class", "male")
            .attr("fill", "steelblue")
            .attr("transform", rTransform)
            .attr("width", function(d) {
                return x1(d.people);
            })
            .attr("y", yr > old ? 20 : -20)
            .attr("height", y.rangeBand())
            .attr("opacity", 0.0001)
            .transition()
            .duration(dur)
            .attr("y", 0)
            .attr("opacity", 1);
        mb.exit()
            .transition()
            .duration(dur)
            .attr("y", yr > old ? -20 : 30)
            .attr("opacity", 0.0001)
            .each("end", function() {
                d3.select(this)
                    .remove();
            });
        mb.transition()
            .duration(dur)
            .attr("transform", rTransform)
            .attr("y", 0)
            .attr("width", function(d) {
                return x1(d.people);
            })
            .attr("opacity", 1);
        mb.select("title")
            .text(tooltipText);
    }

    isYear = function(d) {
        return d.year == year;
    }
    linkClass = function(y) {
        return "y" + y.toFixed(0) + (y == year ? " active" : "");
    }
    tooltipText = function(d) {
        return d3.format(",")(d.people) + " " + (d.sex == 1 ? "men" : "women") + " aged " + (d.age == 85 ? "85+" : d.age + "-" + (d.age + 4)) + " in " + d.year;
    }
    barWidth = function(d) {
        return x1(d.people);
    }


function drawPyramid() {

    document.onkeydown = function(event) {
        var y = year;
        switch (event.keyCode) {
            case 37: // left arrow
                y = Math.max(2010, year - 10);
                break;
            case 39: // right arrow
                y = Math.min(2040, year + 10);
                break;
            case 32: // space bar
                toggle();
                return;
        }
        if (y != year) goTo(y);
    };
    label = d3.select("#pyramid")
        .append("div")
        .attr("class", "label")
        .text(year.toFixed(0));
    vis = d3.select("#pyramid")
        .append("svg:svg")
        .attr("width", 2 * w + 40)
        .attr("height", h + 40)
        .append("svg:g")
        .attr("transform", "translate(20,15)");
    // pyramid bar chart
    vis.append("svg:g")
        .selectAll("text.ages")
        .data(labelbins)
        .enter()
        .append("svg:text")
        .attr("class", "ages")
        .attr("x", w + 15)
        .attr("y", function(d) {
            return y(d) + y.rangeBand() + 7;
        })
        .attr("fill", "#888")
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text(function(d) {
            return (85 - d * 5)
                .toFixed(0);
        });
    rTransform = function(d, i) {
        return "translate(" + (w + 30) + "," + y(i)
            .toFixed(2) + ")";
    }
    lTransform = function(d, i) {
        return "translate(" + x2(d.people)
            .toFixed(2) + "," + y(i)
            .toFixed(2) + ")";
    }
    lEnter = function(d, i) {
        return "translate(" + w + "," + y(i)
            .toFixed(2) + ")";
    }
    var mbars = vis.selectAll("rect.male")
        .data(mdat.filter(isYear))
        .enter()
        .append("rect")
        .attr("id", function(d) {
            return "m" + (d.year - d.age);
        })
        .attr("class", "male")
        .attr("fill", "steelblue")
        .attr("transform", rTransform)
        .attr("width", function(d) {
            return x1(d.people);
        })
        .attr("height", y.rangeBand())
        .attr("y", 0)
        .attr("opacity", 1);
    mbars.append("svg:title")
        .text(tooltipText);
    var fbars = vis.selectAll("rect.female")
        .data(fdat.filter(isYear))
        .enter()
        .append("rect")
        .attr("id", function(d) {
            return "f" + (d.year - d.age);
        })
        .attr("class", "female")
        .attr("fill", "pink")
        .attr("opacity", 1)
        .attr("transform", lTransform)
        .attr("width", function(d) {
            return x1(d.people);
        })
        .attr("height", y.rangeBand())
        .attr("y", 0)
        .attr("opacity", 1);
    fbars.append("svg:title")
        .text(tooltipText);
    // animated intro for bars
    mbars.attr("width", 0)
        .transition()
        .duration(500)
        .delay(function(d, i) {
            return 30 * i;
        })
        .attr("width", barWidth);
    fbars.attr("width", 0)
        .attr("transform", lEnter)
        .transition()
        .duration(500)
        .delay(function(d, i) {
            return 30 * i;
        })
        .attr("width", barWidth)
        .attr("transform", lTransform);
    // age label
    vis.append("svg:text")
        .attr("x", w + 15)
        .attr("y", h + 8)
        .attr("dy", ".71em")
        .attr("fill", "#888")
        .attr("text-anchor", "middle")
        .attr("font-size", "13px")
        .attr("font-variant", "small-caps")
        .attr("letter-spacing", 1)
        .text("age");
    // gridlines and labels for right pyramid
    rules1 = vis.selectAll("g.rule1")
        .data(x1.ticks(3))
        .enter()
        .append("svg:g")
        .filter(function(d) {
            return d > 0;
        })
        .attr("class", "rule1")
        .attr("transform", function(d) {
            return "translate(" + (w + 30 + x1(d)) + ",0)";
        });
    rules1.append("svg:line")
        .attr("y1", h - 2)
        .attr("y2", h + 4)
        .attr("stroke", "#bbb");
    rules1.append("svg:line")
        .attr("y1", 0)
        .attr("y2", h)
        .attr("stroke", "white")
        .attr("stroke-opacity", .3);
    rules1.append("svg:text")
        .attr("y", h + 9)
        .attr("dy", ".71em")
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "#bbb")
        .text(function(d) {
            return (d / 1000)
                .toFixed(0) + "K";
        });
    // gridlines and labels for left pyramid
    rules2 = vis.selectAll("g.rule2")
        .data(x2.ticks(3))
        .enter()
        .append("svg:g")
        .filter(function(d) {
            return d > 0;
        })
        .attr("class", "rule2")
        .attr("transform", function(d) {
            return "translate(" + (x2(d)) + ",0)";
        });
    rules2.append("svg:line")
        .attr("y1", h - 2)
        .attr("y2", h + 4)
        .attr("stroke", "#bbb");
    rules2.append("svg:line")
        .attr("y1", 0)
        .attr("y2", h)
        .attr("stroke", "white")
        .attr("stroke-opacity", .3);
    rules2.append("svg:text")
        .attr("y", h + 9)
        .attr("dy", ".71em")
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "#bbb")
        .text(function(d) {
            return (d / 1000)
                .toFixed(0) + (d == 0 ? "" : "K");
        });

    d3.select("#pyramid")
        .append("div")
        .attr("class", "break");
    div = d3.select("#pyramid")
        .append("div")
        .attr("class", "years");
    div.append("span")
        .attr("class", "title")
        .text("year");
    div.selectAll("span.link")
        .data(d3.range(2000, 2041, 10))
        .enter()
        .append("span")
        .attr("class", "link")
        .append("a")
        .attr("class", linkClass)
        .attr("href", function(d) {
            return "javascript:goTo(" + d + ");";
        })
        .text(function(d) {
            return d.toFixed(0);
        });

    var sex = ["Female", "Male"];
    var sexColor = {"Female" : "pink", "Male": "steelblue"};

    // legend = d3.selectAll("#pyramid")
    //     .append("div")
    //     .attr("class", "legendbox");

    var legenditems = vis.selectAll(".legend")
        .data(sex)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legenditems.append("rect")
        .attr("x", w + w - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d) { return sexColor[d];})

    legenditems.append("text")
        .attr("x", w + w - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; });



    // Play Controls
    // ctrls = d3.select("#pyramid")
    //     .append("div")
    //     .attr("class", "controls");
    div.append("button")
        .attr("class", "btn btn-info")
        .attr("id", "pyrPlay")
        .text("Play")
        .on("click", function() {
            pyrStop = false;
            runpyrLoop();
            showPyrStop();
        });

    div.append("button")
        .attr("class", "btn btn-danger")
        .attr("id", "pyrStop")
        .text("Stop")
        .on("click", function() {
          pyrStop = true;
          showPyrPlay();
        })



    showPyrPlay();
}
