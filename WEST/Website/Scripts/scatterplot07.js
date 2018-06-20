var waitingTableHospitals = [];
var waitingTableDoctors = [];

$(document).ready(function () {

	var headers;
	var root;
	var eclipseRyList;
	var countries;
	var xAxisIndex = 0,
		yAxisIndex = 0,
		sizeIndex = 0;


	//the dimensions of the scatterplot
	var margin = { top: 0, right: 0, bottom: 0, left: WidthLeft + WidthMiddle },
		padding = { top: 60, left: 20, right: 90, bottom: 20 },
		width = WidthRight - padding.left - padding.right,
		height = HeightUp / 1.3 - padding.top - padding.bottom;

	var x_scale = d3.scale.linear()
		.range([0, width]);

	var y_scale = d3.scale.linear()
		.range([height, 0]);

	var size_scale = d3.scale.linear()
		.range([3, 20]);

	var xAxis = d3.svg.axis()
		.orient("bottom");

	var yAxis = d3.svg.axis()
		.orient("left");

	//Lat and Long into pixels
	var m2px = d3.scale.linear()
		.range([BCBorder.X - BCBorder.R * 0.75, BCBorder.X + BCBorder.R * 0.75])
		.domain([RegionsInfo.RangeX.Min, RegionsInfo.RangeX.Max]);
	var m2py = d3.scale.linear()
		.range([BCBorder.Y - BCBorder.R * 0.55, BCBorder.Y + BCBorder.R * 0.55])
		.domain([RegionsInfo.RangeY.Min, RegionsInfo.RangeY.Max]);

	createButtons();

	createScatterPlot();
	updateVisu(true);

	CreateMap();

	CreateArc();
	DrawArc(true);


	createBarChart(true);

	DrawPopulation();

	DrawHouseHold();

	function createButtons() {

		var buttonGroups = d3.select("#buttons");

		buttonGroups.append("label").html("Surgery").style("margin-right", "10px");

		buttonGroups.append("select")
				.attr("id", "dropMenu")
            .on("change", function (d) {
            	var selectedValue = this.value;
            	waitingTableHospitals = FindHospitalsWaitingTime(selectedValue);
            	waitingTableDoctors = FindDoctorsWaitingTime(selectedValue);
            	updateVisu(true);
            	CreateArc();
            	DrawArc(true);
            	createBarChart(true);
            })
            .selectAll("option")
            .data(AllSurgeries)
            .enter()
            .append("option")
			.attr("id", "surgeryOption")
            .text(function (d) {
            	return d.name
            });
		//.attr("font-size", "20px");

		//default surgery
		waitingTableHospitals = FindHospitalsWaitingTime("Breast Biopsy");
		waitingTableDoctors = FindDoctorsWaitingTime("Breast Biopsy");

	}


	///Scatterplot
	function createScatterPlot() {
		root = d3.select("#ScatterPlot").append("g")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + (margin.left + padding.left) + "," + (margin.top + padding.top) + ")");

		root.append("rect")
            .attr({
            	class: "background",
            	width: width,
            	height: height
            }).style({
            	fill: "transparent"
            });

		root.append("g")
            .attr("class", "xAxis axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .append("text")
                .attr("class", "label")
                .attr("x", width)
                .attr("y", -6)
                .style("text-anchor", "end");


		root.append("g")
            .attr("class", "yAxis axis")
            .call(yAxis)
            .append("text")
                .attr("class", "label")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end");
	}

	function updateVisu(animate) { //if there is animate or not		
		x_scale.domain([0, d3.max(waitingTableHospitals, function (d) { return d.fiftyWeek + 2; })]);
		y_scale.domain([0, d3.max(waitingTableHospitals, function (d) { return d.ninetyWeek; })]);
		size_scale.domain([0, d3.max(waitingTableHospitals, function (d) { return d.noWaitingCase; })]);

		console.log(x_scale.domain(), y_scale.domain(), size_scale.domain());
		console.log(x_scale.domain(), "to", x_scale.range());

		var trDuration = animate ? 500 : 0; //duration of my transition...500 miliseconds //if it is true 500 if false, zero, so no animations

		var tip = d3.tip()
			  .attr('class', 'd3-tip')
			  .offset([-10, 0])
			  .html(function (d) {
			  	return "<strong> </strong> <span style='color:white'>" + d.hospital.Name + "</span>";
			  })


		root.call(tip);

		root.selectAll(".country")
			.data(waitingTableHospitals)
			.enter()
			.append("g")
			.attr("class", "country")
			.append("circle")
			.style("fill", function (d) {
				switch (d.region) {
					case Fraser:
						return purple; //different color
					case Interior:
						return red;
					case Northern:
						return yellow;
					case VanC:
						return green;
					case VanI:
						return blue;
					case Provencial:
						return grey;
					default: console.error("unknown continent", JSON.stringify(d));
				}
			}).style("stroke", "black")
			.style("stroke-width", 0)
			.on('mouseover', tip.show)
			.on('mouseout', tip.hide);

		root.selectAll(".country")
            .transition() //for animation changing different counrty when slecting diff options
            .duration(trDuration)
            .delay(function (d, i) { //how long I wait before I start my new animation // i is the index of my data and d is my data... so the data dont move at the same time, each point move by a short delay 
            	//from the other point
            	if (animate) return i * 10;
            	else return 0;
            })
            .attr({
            	transform: function (d) { return "translate(" + [x_scale(d.fiftyWeek), y_scale(d.ninetyWeek)] + ")"; }
            })
            .select("circle")
            .attr("r",
                function (d) {
                	return size_scale(d.noWaitingCase);
                }
		    );

		xAxis.scale(x_scale);
		yAxis.scale(y_scale);

		root.select(".xAxis").call(xAxis)
            .select(".label").text("50% received surgery in weeks");
		root.select(".yAxis").call(yAxis)
            .select(".label").text("90% received surgery in weeks");
	}


	///BarChart
	function createBarChart(animate) {

		var barChartmargin = { top: HeightUp, right: 70, bottom: 100, left: 70 },
				width = WidthLeft + WidthRight + WidthMiddle - barChartmargin.right - barChartmargin.left,
				height = HeightDown - barChartmargin.bottom;

		//Data filling		

		var x = d3.scale.ordinal()
			.rangeRoundBands([0, width], .1);

		var y = d3.scale.linear()
			.range([height, 0]);

		var xAxis = d3.svg.axis()
			.scale(x)
			.orient("bottom");

		var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left")
			.ticks(5);

		function FindRepeatedDoctorIndex(waitingTableDoctors, row) {
			var count = 0;
			for (var i = 0 ; i < waitingTableDoctors.length ; i++) {
				if (waitingTableDoctors[i].doctor == row.doctor) {
					count++;
				}
				if (waitingTableDoctors[i] == row) {
					break;
				}
			}
			return count;
		};

		function DoctorXAxisName(waitingTableDoctors, d) {
			var c = FindRepeatedDoctorIndex(waitingTableDoctors, d);
			return d.doctor.name + Array(c).join(" ");
		}

		waitingTableDoctors.sort(function (a, b) {
			if (a.region.name < b.region.name) {
				return -1;
			}
			else if (a.region.name > b.region.name) {
				return 1;
			}
			else {
				if (a.doctor.name < b.doctor.name) {
					return -1;
				}
				else if (a.doctor.name > b.doctor.name) {
					return 1;
				}
				else {
					return waitingTableDoctors.indexOf(a) - waitingTableDoctors.indexOf(b);
				}
			}
		});

		x.domain(waitingTableDoctors.map(function (d) {
			return DoctorXAxisName(waitingTableDoctors, d);
		}));
		y.domain([0, d3.max(waitingTableDoctors, function (d) { return (d.noWaitingCase); })]);

		var trDuration = animate ? 500 : 0; //duration of my transition...500 miliseconds //if it is true 500 if false, zero, so no animations


		var tip = d3.tip()
				  .attr('class', 'd3-tip')
				  .offset([-10, 0])
				  .html(function (d) {
				  	return "<strong>CasesWaiting:</strong> <span style='color:white'>" + d.noWaitingCase + "</span>";
				  })


		var svg = d3.select("#BarChart");

		d3.select("#xAxisBar").remove();
		d3.select("#yAxisBar").remove();

		svg.append("g")
			.attr("id", "barChart");

		svg.attr("width", width + barChartmargin.left + barChartmargin.right)
			.attr("height", height + barChartmargin.top + barChartmargin.bottom)
			.attr("transform", "translate(" + barChartmargin.left + "," + barChartmargin.top + ")");

		svg.call(tip);

		var xAxisGroup = svg.append("g")
			.attr("class", "x axis")
			.attr("id", "xAxisBar")
			.attr("transform", "translate(0," + height + ")")
			.attr("fill", "grey")
			.call(xAxis)
			.selectAll("text");

		xAxisGroup.style("text-anchor", "end")
				.style("font-size", "8px")
				.attr("dx", "-.8em")
				.attr("dy", ".15em");

		xAxisGroup.attr("transform", function (d) {
			return "rotate(-55)"
		});


		svg.append("g")
			.attr("class", "y axis")
			.attr("id", "yAxisBar")
			.attr("fill", "grey")
			.call(yAxis)
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", -56)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("Cases Waiting");



		var i = 0
		//var bar = svg.selectAll("#BarChart").data(waitingTableDoctors);
		var bar = d3.select("#barChart")
					.selectAll("rect")
					.data(waitingTableDoctors);

		bar.enter()
			.append("rect")
			//.attr("class", "bar")		
			.on('mouseover', tip.show)
			.on('mouseout', tip.hide);

		bar.transition() //for animation changing different counrty when slecting diff options
					.duration(trDuration)
					.delay(function (d, i) { //how long I wait before I start my new animation // i is the index of my data and d is my data... so the data dont move at the same time, each point move by a short delay 
						//from the other point
						if (animate) return i * 10;
						else return 0;
					})
				.attr("x", function (d) { return x(DoctorXAxisName(waitingTableDoctors, d)); })
				.attr("width", x.rangeBand())
				.attr("y", function (d) { return y(d.noWaitingCase); })
				.attr("height", function (d) { return height - y((d.noWaitingCase)); })
				.style("fill", function (d) {
					if (d.hospital.region == Fraser)
						return red;
					else if (d.hospital.region == Interior) {
						return purple;
					}
					else if (d.hospital.region == Northern) {
						return yellow;
					}
					else if (d.hospital.region == VanC) {
						return green;
					}
					else if (d.hospital.region == VanI) {
						return blue;
					}
					else if (d.hospital.region == Provencial) {
						return grey;
					}
				});

		bar.exit().remove();

	}

	///Map
	function CreateMap() {

		var map = d3.select("#Map");

		map.append("g")
			.attr("id", "GeoMap");

		map.append("g")
			.attr("id", "MapHospitals");

		map.append("g")
			.attr("id", "MapLinks");

		map.append("g")
			.attr("id", "MapArcs");


		//var RegionColors = ['#FF4D4D', '#CC66FF', '#ADFF85', '#70DBFF', '#FFFF66'];
		var RegionColors = [red, purple, green, blue, yellow];

		for (var i = 0; i < RegionsInfo.Regions.length; i++) {
			var region = RegionsInfo.Regions[i];

			for (var j = 0; j < region.Parts.length; j++) {
				var regionPart = region.Parts[j];

				var polygonBuilder = [];
				for (var t = 0; t < regionPart.length; t++) {
					polygonBuilder.push(m2px(regionPart[t][0]) + "," + m2py(regionPart[t][1]) + " ");
				}

				d3.select("#GeoMap")
					.append("polygon")
					.attr("fill", RegionColors[i])
					.attr("points", polygonBuilder.join(""));
			}
		}

		for (var i = 0; i < regions.length; i++) {
			for (var j = 0; j < regions[i].Hospitals.length; j++) {
				d3.select("#MapHospitals")
				.append("circle")
				.attr("cx", m2px(regions[i].Hospitals[j].X))
				.attr("cy", m2py(regions[i].Hospitals[j].Y))
				.attr("r", 3)
				.attr("stroke", "black")
				.attr("stroke-width", "0px")
				.attr("fill", "black")
				.attr("opacity", "0.6");
			}
		}
	}


	///Arcs and links
	function CreateArc() {

		eclipseRyList = [];
		var arcPaddingDegree = 5;
		var minWaitingTime = 0;
		var totalPaddingDegree = arcPaddingDegree * waitingTableHospitals.length;
		var sumWaitingTime = 0;
		var RegionOrders = [Fraser, Provencial, VanI, VanC, Northern, Interior];

		for (var i = 0; i < waitingTableHospitals.length ; i++) {

			sumWaitingTime = sumWaitingTime + waitingTableHospitals[i].noWaitingCase + minWaitingTime;
		}

		waitingTableHospitals.sort(function (a, b) {
			return RegionOrders.indexOf(a.hospital.region) - RegionOrders.indexOf(b.hospital.region);

		});

		for (var j = 0; j < waitingTableHospitals.length; j++) {
			if (j == 0) {
				eclipseRyList.push({
					startAlfa: 0,
					endAlfa: (waitingTableHospitals[j].noWaitingCase + minWaitingTime) / sumWaitingTime * (360 - totalPaddingDegree) + 0,
					hospital: waitingTableHospitals[j].hospital,
				});
			}
			else {
				eclipseRyList.push({
					startAlfa: eclipseRyList[j - 1].endAlfa + arcPaddingDegree,
					endAlfa: (waitingTableHospitals[j].noWaitingCase + minWaitingTime) / sumWaitingTime * (360 - totalPaddingDegree) + eclipseRyList[j - 1].endAlfa + arcPaddingDegree,
					hospital: waitingTableHospitals[j].hospital,
				});
			}

		}
	}

	function linkArc(d) {
		var avrAlfa = (d.startAlfa + d.endAlfa) / 2;
		var y = Math.sin(avrAlfa / 360 * 2 * Math.PI) * BCBorder.R + BCBorder.Y;
		var x = Math.cos(avrAlfa / 360 * 2 * Math.PI) * BCBorder.R + BCBorder.X;
		var dx = m2px(d.hospital.X) - x;
		var dy = m2py(d.hospital.Y) - y;
		var dr = Math.sqrt(dx * dx + dy * dy);
		return "M" + m2px(d.hospital.X) + "," + m2py(d.hospital.Y) + "A" + dr + "," + dr + " 0 0,1 " + x + "," + y;
	}

	function DrawArc(animate) {
		//draw arc
		var map = d3.select("#Map");
		var trDuration = animate ? 500 : 0; //duration of my transition...500 miliseconds //if it is true 500 if false, zero, so no animations



		var tip = d3.tip()
				  .attr('class', 'd3-tip')
				  .offset([-10, 0])
				  .html(function (d) {
				  	return "<strong> </strong> <span style='color:white'>" + d.hospital.Name + "</span>";
				  })
		map.call(tip);


		var mapArcsData = d3.select("#MapArcs")
							.selectAll("path")
							.data(eclipseRyList);


		mapArcsData.enter()
				.append("path")
				.attr("fill", "transparent")
				.attr("stroke-width", 30)
				.attr("stroke-linecap", "round")
				.on('mouseover', tip.show)
				.on('mouseout', tip.hide);

		mapArcsData.transition() //for animation changing different counrty when slecting diff options
					.duration(trDuration)
					.delay(function (d, i) { //how long I wait before I start my new animation // i is the index of my data and d is my data... so the data dont move at the same time, each point move by a short delay 
						//from the other point
						if (animate) return i * 10;
						else return 0;
					})
			.attr("d", function (d) {
				var sx = Math.cos(d.startAlfa / 360 * 2 * Math.PI) * BCBorder.R + BCBorder.X;
				var sy = Math.sin(d.startAlfa / 360 * 2 * Math.PI) * BCBorder.R + BCBorder.Y;

				var ex = Math.cos(d.endAlfa / 360 * 2 * Math.PI) * BCBorder.R + BCBorder.X;
				var ey = Math.sin(d.endAlfa / 360 * 2 * Math.PI) * BCBorder.R + BCBorder.Y;
				return "M" + ex + "," + ey + " A" + BCBorder.R + "," + BCBorder.R + " 0 0,0 " + sx + "," + sy;

			})

				.attr("stroke", function (d, i) {
					if (d.hospital.region == Fraser)
						return purple;
					else if (d.hospital.region == Interior) {
						return red;
					}
					else if (d.hospital.region == Northern) {
						return yellow;
					}
					else if (d.hospital.region == VanC) {
						return green;
					}
					else if (d.hospital.region == VanI) {
						return blue;
					}
					else if (d.hospital.region == Provencial) {
						return grey;
					}
					//rgb(" + ((eclipseRyList.length - 1 - i) * 255 / (eclipseRyList.length - 1)) + ", 0, 0)";
				});

		mapArcsData.exit().remove();

		//Paths between ellipses and hospitals


		var mapLinksData = map.select("#MapLinks")
							  .selectAll("path")
							  .data(eclipseRyList);

		mapLinksData.enter()
					.append("path")
					.attr("fill", "transparent")
					.attr("stroke-width", "1px")
					.attr("stroke", "black")
					.attr("stroke-dasharray", "10,5");

		mapLinksData.attr("d", linkArc);

		mapLinksData.exit().remove();
	}


	////Population
	function DrawPopulation() {

		var margin = { top: 0, right: 0, bottom: 0, left: WidthLeft + WidthMiddle },
			padding = { top: 60, left: 20, right: 20, bottom: 20 },
			width = WidthRight - padding.left - padding.right,
			height = HeightUp / 3 - padding.top - padding.bottom;

		var tip = d3.tip()
			  .attr('class', 'd3-tip')
			  .offset([-10, 0])
			  .html(function (d) {
			  	return "<span style='color:white'>" + d.population + "</span>";
			  });

		var populationData = [{ region: Interior, population: 0.730712 }, { region: Fraser, population: 1.706824 }, { region: VanC, population: 1.146312 }, { region: VanI, population: 0.759725 }, { region: Northern, population: 0.287729 }];
		var pop = d3.select("#populationChart");

		var bar = pop.selectAll("g.human")
					.data(populationData);


		pop.attr("width", width)
			.attr("height", height)
			.attr("transform", "translate(" + (margin.left + padding.left) + "," + (margin.top + padding.top) + ")");

		pop.call(tip);

		var x = d3.scale.ordinal()
			.rangeRoundBands([0, width], .1);

		var y = d3.scale.linear()
			.range([height, 0]);

		var xAxis = d3.svg.axis()
			.scale(x)
			.orient("bottom");

		var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left");


		x.domain(populationData.map(function (d) { return d.region.name; }));
		y.domain([0, d3.max(populationData, function (d) { return (d.population); })]);


		var gHuman = bar.enter()
			.append("g")
			.attr("class", "human")
			.style("fill", function (d) {
				if (d.region == Fraser)
					return red;
				else if (d.region == Interior) {
					return purple;
				}
				else if (d.region == Northern) {
					return yellow;
				}
				else if (d.region == VanC) {
					return green;
				}
				else if (d.region == VanI) {
					return blue;
				}
				else if (d.region == Provencial) {
					return grey;
				}
			})
			.attr("transform", function (d) { return "translate(" + x(d.region.name) + "," + y(d.population) + ") scale(" + .2 + "," + (height - y(d.population)) / 463 + ") "; })
		//	.attr("opacity", 0.5)
			.on('mouseover', tip.show)
			.on('mouseout', tip.hide);

		gHuman.append("path")
			.attr("d", "m212.828003,128.610001l-85.639999,89.031998l17.806,17.806l67.834,-72.072998l0.848999,121.252014l-58.507004,180.607971c0,0 38.156998,0.951019 39.005005,-0.744995c0.423004,-0.847992 42.395004,-167.143005 44.091003,-169.686981l47.483994,169.583984l36.459991,0l-58.505981,-178.911987l0.847992,-122.100006l69.528992,70.378006l20.351013,-16.959l-88.184021,-88.184006l-53.419983,0z")
			.attr("transform", "translate(-92,0)");
		gHuman.append("path")
			.attr("d", "m239.113998,12.4448c-79.705002,1.6958 -78.856995,105.990197 -2.543991,106.838197c82.248993,0 84.791992,-105.990197 2.543991,-106.838197z")
			.attr("transform", "translate(-92,0)");

		var xAxisGroup = pop.append("g")
		.attr("class", "x axis")
		.attr("id", "xAxisPopulation")
		.attr("transform", "translate(0," + height + ")")
		.attr("fill", "grey")
		.call(xAxis)
		.selectAll("text");

		xAxisGroup.style("font-size", "12px")
			.style("text-anchor", "end")
			.attr("dx", "-.8em")
			.attr("dy", ".15em")
			.attr("transform", function (d) {
				return "rotate(-55)"
			});


		pop.append("g")
			.attr("class", "y axis")
			.attr("id", "yAxisPopulation")
			.attr("fill", "grey")
			.call(yAxis)
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("population (millions)");
	}

	function DrawHouseHold() {

		var margin = { top: HeightUp / 3 + 76, right: 0, bottom: 0, left: WidthLeft + WidthMiddle },
			padding = { top: 60, left: 20, right: 20, bottom: 20 },
			width = WidthRight - padding.left - padding.right,
			height = HeightUp / 3 - padding.top - padding.bottom;
		//*
		var tip = d3.tip()
			  .attr('class', 'd3-tip')
			  .offset([-10, 0])
			  .html(function (d) {
			  	return "<span style='color:white'>" + d.houseHold + "</span>";
			  });
		//*/
		var houseHoldData = [{ region: Interior, houseHold: 314.316 }, { region: Fraser, houseHold: 631.863 }, { region: VanC, houseHold: 483.532 }, { region: VanI, houseHold: 338.575 }, { region: Northern, houseHold: 116.545 }];
		var pop = d3.select("#houseHoldChart");

		var bar = pop.selectAll("g.houseHold")
					.data(houseHoldData);


		pop.attr("width", width)
			.attr("height", height)
			.attr("transform", "translate(" + (margin.left + padding.left) + "," + (margin.top + padding.top) + ")");

		pop.call(tip);

		var x = d3.scale.ordinal()
			.rangeRoundBands([0, width], .1);

		var y = d3.scale.linear()
			.range([height, 0]);

		var xAxis = d3.svg.axis()
			.scale(x)
			.orient("bottom");

		var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left")
			.tickValues([0, 200, 400, 600]);


		x.domain(houseHoldData.map(function (d) { return d.region.name; }));
		y.domain([0, d3.max(houseHoldData, function (d) { return (d.houseHold); })]);


		var gHuman = bar.enter()
			.append("g")
			.attr("class", "houseHold")
			.style("fill", function (d) { return getColor(d.region); })
		//	.attr("opacity", 0.5)
			.on('mouseover', tip.show)
			.on('mouseout', tip.hide);

		var externalG = gHuman.append("g")
			.attr("transform", function (d) { return "translate(" + x(d.region.name) + "," + y(d.houseHold) + ") scale(" + (x.rangeBand() / 466) + "," + (height - y(d.houseHold)) / 441 + ") "; });

		var gHouse = externalG.append("g")
			.attr("transform", "translate(-42.339286,-276.34171)");
		gHouse.append("path")
			.attr("d", "M 437.14509,499.4375 L 437.14509,499.4375 z M 437.14509,499.4375 L 274.33259,355.25 L 111.42634,499.5 L 111.42634,705.625 C 111.42634,710.94838 115.72796,715.21875 121.05134,715.21875 L 222.86384,715.21875 L 222.86384,624.84375 C 222.86384,619.52035 227.13421,615.21875 232.45759,615.21875 L 316.11384,615.21875 C 321.43719,615.21875 325.70759,619.52037 325.70759,624.84375 L 325.70759,715.21875 L 427.55134,715.21875 C 432.87471,715.21875 437.14511,710.9484 437.14509,705.625 L 437.14509,499.4375 z M 111.42634,499.5 L 111.42634,499.5 z");
		gHouse.append("path")
			.attr("d", "M 273.3878,276.34171 L 42.339286,480.92527 L 66.677596,508.38266 L 274.33298,324.49848 L 481.9411,508.38266 L 506.23215,480.92527 L 275.2309,276.34171 L 274.33298,277.3814 L 273.3878,276.34171 z");
		gHouse.append("path")
			.attr("d", "M 111.42634,305.79074 L 169.99777,305.79074 L 169.48739,340.48183 L 111.42634,392.9336 L 111.42634,305.79074 z");

		/*
		gHuman.append("path")
			.attr("transform", function (d) { return "translate(" + x(d.region.name) + "," + y(d.houseHold) + ") scale(" + (x.rangeBand() / 348) + "," + (height - y(d.houseHold)) / 463 + ") "; })
			.attr("d", "M233.333,160c-4.703,4.703-69.124,65.807-106.666,101.395v125.272h80v-100h66.666v100h80V261.189C314.309,224.083,246.667,160,246.667,160S240,153.333,233.333,160z M353.333,120c0-7.363-5.97-13.333-13.333-13.333h-26.667c-7.363,0-13.333,5.97-13.333,13.333v11.562c16.895,16.159,35.998,34.396,53.333,50.932V120z M406.667,246.667c0,0-140-133.334-153.334-146.667c-13.333-13.333-26.666,0-26.666,0S80,240,73.333,246.667c-6.666,6.666,0,13.333,0,13.333s6.667,6.667,13.334,13.333c6.666,6.667,13.333,0,13.333,0s126.667-120,133.333-126.666c6.667-6.667,13.334,0,13.334,0s126.666,120,133.333,126.666c6.667,6.667,13.333,0,13.333,0s0,0,13.334-13.333C413.333,253.333,406.667,246.667,406.667,246.667z")
			//.attr("transform", "translate(-75,0)");
		;*/
		/*
		gHuman.append("rect")
			.attr("x", function (d) { return x(d.region.name); })
				.attr("width", x.rangeBand())
				.attr("y", function (d) { return y(d.houseHold); })
				.attr("height", function (d) { return height - y((d.houseHold)); })
				.style("fill", function (d) { return getColor(d.region); });
		//*/
		var xAxisGroup = pop.append("g")
		.attr("class", "x axis")
		.attr("id", "xAxishouseHold")
		.attr("transform", "translate(0," + height + ")")
		.attr("fill", "grey")
		.call(xAxis)
		.selectAll("text");

		xAxisGroup.style("font-size", "12px")
				.style("text-anchor", "end")
				.attr("dx", "-.8em")
				.attr("dy", ".15em")
				.attr("transform", function (d) {
					return "rotate(-55)"
				});



		pop.append("g")
			.attr("class", "y axis")
			.attr("id", "yAxishouseHold")
			.attr("fill", "grey")
			.call(yAxis)
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("households (K)");
	}
});







