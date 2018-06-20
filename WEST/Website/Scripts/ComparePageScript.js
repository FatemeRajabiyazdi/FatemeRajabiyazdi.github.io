/////
////It should be able to select a surgey and which hospitals perform that 

// 3 hospitals are selected - show them on BC Map highlighted the specific hospital
// Show the scatter plot but highlighted the specific hospital
// Barchart of only that specific hospital doctors 

$(document).ready(function () {

	//dimension of each item

	//The BC Map
	var mapMargin = { top: 90, right: 0, bottom: 0, left: 10 },
		mapPadding = { top: 60, left: 0, right: 20, bottom: 20 },
		mapWidth = (widthPerElement - mapPadding.left - mapPadding.right),
		mapHeight = (heightPerElementUp - mapPadding.top - mapPadding.bottom);
	

	//The ScatterPlot
	var scatterMargin = { top: 90, right: 0, bottom: 0, left: 10 },
		scatterPadding = { top: 60, left: 0, right: 20, bottom: 20 },
		scatterWidth = (widthPerElement - scatterPadding.left - scatterPadding.right),
		scatterHeight = (heightPerElementMed - scatterPadding.top - scatterPadding.bottom);

	//The BarChart
	var barMargin = { top: 90, right: 0, bottom: 0, left: 10 },
		barPadding = { top: 60, left: 0, right: 20, bottom: 20 },
		barWidth = (widthPerElement - barPadding.left - barPadding.right),
		barHeight = (heightPerElementDown - barPadding.top - barPadding.bottom);


	//Lat and Long into pixels
	var m2px = d3.scale.linear()
		.range([mapBorder.X - mapBorder.R * 0.75, mapBorder.X + mapBorder.R * 0.75])
		.domain([RegionsInfo.RangeX.Min, RegionsInfo.RangeX.Max]);
	var m2py = d3.scale.linear()
		.range([mapBorder.Y - mapBorder.R * 0.55, mapBorder.Y + mapBorder.R * 0.55])
		.domain([RegionsInfo.RangeY.Min, RegionsInfo.RangeY.Max]);



});