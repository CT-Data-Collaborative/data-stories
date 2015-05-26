function map() {
  var geojson, info, stateLayer;
  var layerObj = {};
  var layerKey = {2010: "percent10", 2015: "percent15", 2020: "percent20", 2025:"percent25"}
  var mapYears = [2010,2015,2020,2025];
  var currentLayer = mapYears[0];


  function addSlider(yearArray) {
    firstYear = yearArray[0];
    lastYear = yearArray[yearArray.length - 1];
    // $("#firstyear").text(firstYear);
    // $("#lastyear").text(lastYear);
    // var newslider = $("#mapslider").slider();
    // $('#mapslider').on('change', function(slideEvt) {
    //     myear = slideEvt.value;
    //     currentLayer = myear.newValue;
    //     setVariable(myear.newValue);
    // });
    var stop = true;

    var mapYearSelector = d3.select("#firstyear");

    mapYearSelector.append("span")
      .text("year")
      .attr("id", "sliderLabel");
      // .style("font-variant", "small-caps");

    mapYearSelector.selectAll("span.mapyear")
      .data(yearArray)
      .enter().append("span")
      .attr("class", "mapyear")
      .attr("id", function(d) { return "mapyear-" + d; })
      .append("a")
      .attr("class", "mapyearLinkClass")
      .on("click", function(d) {
        d3.selectAll(".mapyearLinkClass").attr("class", "mapyearLinkClass");
        d3.select(this).attr("class", "mapyearLinkClass active");
        currentLayer = d;
        setVariable(d);
      })
      .text(function(d) { return d.toFixed(0);});

    d3.select("#mapyear-2010 a").attr("class", "mapyearLinkClass active");

    $('#mapPlay').click(function() {
      stop = false;
      runMapLoop();
      showStop();
     });
    $('#mapStop').click(function() {
      stop = true;
      showPlay();
     });

    function showStop() {
      $("#mapPlay").hide();
      $("#mapStop").show();
    }

    function showPlay() {
      $("#mapStop").hide();
      $("#mapPlay").show();
    }

    function runMapLoop() {
      setTimeout(mapLoop, 1500);
    }

    function mapLoop() {
      if(stop)
        return false;
      currentLayerIndex = mapYears.indexOf(currentLayer);
      if (currentLayerIndex == (mapYears.length-1)) {
        currentLayer = mapYears[0];
      } else {
        currentLayer = mapYears[currentLayerIndex+1];
      }
      var links = d3.selectAll(".mapyearLinkClass").attr("class", "mapyearLinkClass");
      var activeLink = d3.select("#mapyear-" + currentLayer + " a").attr("class", "mapyearLinkClass active");
      setVariable(currentLayer);
      runMapLoop();
    }
    showPlay();
  }

  addSlider(mapYears);

  function getColor(d) {
      return d > 0.2    ? '#0A0F1C' :
             d > 0.17   ? '#0C527F' :
             d > 0.15   ? '#7E9FC5' :
             d > 0.13   ? '#C1D0E3' :
                          '#F2E2E5';
  }
  function mapColor(layer, variableName) {
    var perOv65 = layer.feature.properties[variableName];
    if (typeof perOv65 == 'undefined') {
        return "#787878";
    } else {
        return getColor(perOv65);
    }
  }

  function style(feature) {
    return {
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.9,
        fillColor: mapColor(feature)
      };
    }

  info = L.control();

  info.onAdd = function (map) {
      this._div = L.DomUtil.create('div', 'info');
      this.update();
      return this._div;
  };

  info.update = function (props) {
      key = layerKey[currentLayer];
      this._div.innerHTML = '<h4>CT Population Over 65</h4>' +  (props ?
      '<b>' + props.name + '</b><br />' + (props[key]*100).toFixed(1) + ' %'
              : 'Hover over a town');
  };



  function highlightFeature(e) {
      var layer = e.target;
      layer.setStyle({
          weight: 5,
          color: '#666',
          dashArray: '',
          fillOpacity:1
      });

      if (!L.Browser.ie && !L.Browser.opera) {
          layer.bringToFront();
      }

      info.update(layer.feature.properties);
  }

  function resetHighlight(e) {
    var layer = e.target;
    layer.setStyle({
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.9
    });
    info.update();
  }

  function onEachFeature(feature, layer) {
      layer.on({
          mouseover: highlightFeature,
          mouseout: resetHighlight,
      });
  }

  $.getJSON('static/data/towns_with_data.geojson', function(data) {

    var boundaries = data;
    var map = L.map('map');
    var baselayer = L.tileLayer("http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
        attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
        subdomains: 'abcd',
        minZoom: 0,
        maxZoom: 20
    }).addTo(map);
    map.attributionControl.addAttribution('Population data &copy; <a href="http://census.gov/">US Census Bureau</a>');

    // set variable for first layer
    boundaries.features.forEach(function(town) {
        town.properties.percentOver65 = town.properties.percent10;;
      });

    stateLayer = L.geoJson(boundaries, {
      onEachFeature: onEachFeature
    }).addTo(map);



    info.addTo(map);
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
        // Since the getColor function is expecting numbers, not strings, I modified this array
                grades = [0, 0.131, 0.151, 0.171, 0.201]
                labels = [];

        for (var i = 0; i < grades.length; i++) {
            var from = grades[i];
            var to = grades[i + 1];
            labels.push(
                    '<i style="background:' + getColor(from) + '"></i> ' +
                    Math.round(from*100) + "%" + (Math.round(to*100) ? '&ndash;' + Math.round(to*100) + "%" : '+'));
        }

        div.innerHTML = labels.join('<br>');
        return div;
    };

    legend.addTo(map);

    setVariable(mapYears[0]);
    map.fitBounds([
      [42.050942,-73.491669],
      [42.025033, -71.792908],
      [41.318878,-71.848183],
      [40.987213,-73.664703]
      ]);
  })

// This is not setting a JavaScript
// variable, but rather the variable by which the map is colored.
// The input is a string 'currentYear', which specifies which property
// of the  geoJSON file is used to color the map.
  function setVariable(currentYear) {
    variableName = layerKey[currentYear];
    stateLayer.eachLayer(function(layer) {
      layer.setStyle({
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.9,
        fillColor: mapColor(layer, variableName)
      })
    })
  }
}
