/* Project specific Javascript goes here. */
$(function() {
	var geojson;
	makeMap(); 
	makeChart();
});
			
function makeMap(){	
	//var tileLayer = new L.StamenTileLayer("toner-lite");

	var url = "http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}";

	var tileLayer = new L.tileLayer("http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}");
	$.getJSON('/static/data/eitc.geojson', function(data) {
		geojson = L.geoJson(data, {
			style: style,
			onEachFeature: function(feature, layer) {
				layer.on({
					mouseover: highlightNeighborhood,
					mouseout: resetHighlight,
				});
			}
		});
		var map = new L.map('map', {zoomControl: false}).fitBounds(geojson.getBounds());
        new L.Control.Zoom({ position: 'topleft' }).addTo(map);
		tileLayer.addTo(map);
		geojson.addTo(map);
		
		var legend = L.control({position: 'bottomleft'});

		legend.onAdd = function (map) {
			var div = L.DomUtil.create('div', 'legend'),
			grades = [0, 123, 238, 532, 1183],
			labels = [];

			for (var i = 0; i < grades.length; i++) {
				div.innerHTML += 
					'<i style="background: ' + getColor(grades[i]+1) + '"></i>' + 
					grades[i] + (grades[i+1] ? '&ndash;' + grades[i+1] + '<br>' : '+');
			}
			return div;
		};
		legend.addTo(map);
	});
}

function getColor(d) {
    return d > 1183 ? '#006d2c' :
           d > 532 ? '#31a354' :
           d > 238 ? '#74c476' :
           d > 123 ? '#bae4b3' :
                     '#edf8e9';
}

function style(feature) {
	return {
		fillColor: getColor(feature.properties.eitc_num_eitc_credits_claimed),
		weight: 1,
		opacity: 1,
		color: 'white',
		//dashArray: '3',
		fillOpacity: 1
	};
}

function highlightNeighborhood(e) {
	var layer = e.target;

	layer.setStyle({
		"color": "#666",
		weight: 2
	});
	
	$("#state-total").text(('$' + parseFloat(layer.feature.properties.eitc_amount_of_eitc_claimed, 10).
							toFixed(2).
							replace(/(\d)(?=(\d{3})+\.)/g, "$1,").
							toString()).
							slice(0,-3));
	$('#state-credit').text(layer.feature.properties.eitc_avg_ct_amt_per_claim);
	$('#federal-credit').text(layer.feature.properties.eitc_avg_fed_amount_per_claim);
	$('.town-name').text(layer.feature.properties.NAME);
	$('#number-claimed').text(layer.feature.properties.eitc_num_eitc_credits_claimed);
	if (!L.Browser.ie && !L.Browser.opera) {
		layer.bringToFront();
	}
}

function resetHighlight(e) {
	geojson.resetStyle(e.target);
	$('.town-name').text("Connecticut");
	$('#state-total').text('$110,566,775');
	$('#state-credit').text('$603');
	$('#federal-credit').text('$2,011');
	$('#number-claimed').text('183,322');
}


function makeChart() { 
    $('#chart').highcharts({
		chart: {
			margin: [0,0,25,0],
			spacingTop: 0,
			spacingBottom: 0,
			spacingLeft: 0,
			spacingRight: 0,
			backgroundColor: '#E9EEF6'
		},
		title: {
			text: null
		},
		credits: {
			enabled: false
		},
        tooltip: {
            pointFormat: '<b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
				size: '100%',
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: false,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            }
        },
        series: [{
            type: 'pie',
            name: 'EITC by Race',
            data: [
                ['White', 50.9],
                ['Black', 17.8],
                ['Asian', 3.1],
                ['Hispanic', 26.2],
                ['Other', 2.1]
                ]
        }]
    });
}
