var Onopacity = 0.9;
var Offopacity = 0.5;
var animationDuration = 500;

var SelectionManager = (function () {
	function SelectionManager() { }

	SelectionManager.SelectRelatives = function (tip, d, x, y) {
		var tempID = (d.hospital) ? d.hospital.ID : d.ID;
		d3.selectAll("." + tempID)
			.style("opacity", Onopacity)
			.attr("stroke-dasharray", "");

		d3.select("#ScatterPlotMatrix").selectAll("." + tempID)
			.attr("r", 2.5 * ScatterCircleR);

		if (tip)
			tip.show(d, x, y);
	}

	SelectionManager.DeSelectRelatives = function (tip, d, x, y) {
		var tempID = (d.hospital) ? d.hospital.ID : d.ID;
		d3.selectAll("." + tempID)
			.style("opacity", Offopacity)
			.attr("stroke-dasharray", "10,5");

		d3.select("#ScatterPlotMatrix").selectAll("." + tempID)
			.attr("r", ScatterCircleR);

		if (tip)
			tip.hide(d, x, y);
	}

	return SelectionManager;
})();

var RegionColorMapping = (function () {
	function RegionColorMapping() { }

	//var purple = "rgb(120,73,177)";
	//var purple = "rgb(78,48,115)";
	//var green = "#1D7325";
	//var yellow = "#FFB84D";
	var blue = "#65D0ED";
	//var red = "rgb(149,39,37)";
	//var grey = "rgb(120,120,120)";

	var purple = "#C2A6D1";
	//var green = "#1D7325";
	var green = "#D6FF7D";
	//var yellow = "#FFB84D";
	var yellow = "#FDC536";

	//var blue = "#13586B";
	//var red = "rgb(149,39,37)";
	var red = "#EC7A6C";
	//var grey = "rgb(120,120,120)";
	var grey = "#DBDAD6";

	RegionColorMapping.GetColor = function (region) {
		if (region == Fraser)
			return red;
		else if (region == Interior) {
			return purple;
		}
		else if (region == Northern) {
			return yellow;
		}
		else if (region == VanC) {
			return green;
		}
		else if (region == VanI) {
			return blue;
		}
		else if (region == Provencial) {
			return grey;
		}
	}

	RegionColorMapping.GetColorPopulation = function (region) {
		var max = d3.max(populationData, function (d) { return (d.population); });
		var min = d3.min(populationData, function (d) { return (d.population); });
		var temp;

		for (var i = 0 ; i < populationData.length ; i++) {
			if (populationData[i].region == region) {
				temp = populationData[i].population;
			}
		}

		var color = (0 - 150) / (max - min) * (temp - min) + 150;
		color = Math.round(color);

		return "rgb(" + color + "," + color + "," + color + ")";

	}

	RegionColorMapping.GetColorHouseHold = function (region) {
		var max = d3.max(houseHoldData, function (d) { return (d.houseHold); });
		var min = d3.min(houseHoldData, function (d) { return (d.houseHold); });
		var temp;

		for (var i = 0 ; i < houseHoldData.length ; i++) {
			if (houseHoldData[i].region == region) {
				temp = houseHoldData[i].houseHold;
			}
		}

		var color = (0 - 150) / (max - min) * (temp - min) + 150;
		color = Math.round(color);

		return "rgb(" + color + "," + color + "," + color + ")";


	}

	return RegionColorMapping;
})();

var BCMap = (function () {
	function BCMap(settings) {
		this.container = settings.container;
		this.mapCenter = settings.mapCenter;
		this.mapRadius = settings.mapRadius;
		this.arcLengthParameter = settings.arcLengthParameter;
		this.hospitals = settings.hospitals;

		this.mapContainer = null;
		this.geoMap = null;
		this.hospitalsMap = null;
		this.arcsList = null;
		this.mapLinks = null;
		this.OnHospitalClick = null;

		this.m2px = d3.scale.linear()
			.range([this.mapCenter.x - this.mapRadius * 0.66, this.mapCenter.x + this.mapRadius * 0.66])
			.domain([RegionsInfo.RangeX.Min, RegionsInfo.RangeX.Max]);
		this.m2py = d3.scale.linear()
			.range([this.mapCenter.y - this.mapRadius * 0.53, this.mapCenter.y + this.mapRadius * 0.53])
			.domain([RegionsInfo.RangeY.Min, RegionsInfo.RangeY.Max]);
	}

	BCMap.GetColor = RegionColorMapping.GetColor;

	var RegionOrders = [Fraser, Provencial, VanI, VanC, Northern, Interior];

	BCMap.prototype.Draw = function (animate) {
		this.mapContianer = this.container.select("g.map");
		if (!this.mapContianer.empty()) {
			this.mapContianer.remove();
		}

		this.mapContianer = this.container
			.append("g")
			.classed("map", true);

		this.DrawGeoMap();
		this.DrawHospitals();
		this.DrawArcs(animate);
		this.DrawLinks(animate);

		return this;
	}

	BCMap.prototype.DrawGeoMap = function () {
		this.geoMap = this.mapContianer.select("g.geoMap");

		if (this.geoMap.empty()) {
			this.geoMap = this.mapContianer
				.append("g")
				.classed("geoMap", true);
		}

		for (var i = 0; i < RegionsInfo.Regions.length; i++) {
			var region = RegionsInfo.Regions[i];

			for (var j = 0; j < region.Parts.length; j++) {
				var regionPart = region.Parts[j];

				var polygonBuilder = [];
				for (var t = 0; t < regionPart.length; t++) {
					polygonBuilder.push(this.m2px(regionPart[t][0]) + "," + this.m2py(regionPart[t][1]) + " ");
				}

				for (var k = 0 ; k < regions.length ; k++) {
					if (regions[k].name == region.Name) {
						this.geoMap
							.append("polygon")
							.attr("fill", function (d) {
								return BCMap.GetColor(regions[k]);
							})
							.style("opacity", Offopacity)
							.attr("points", polygonBuilder.join(""));
						break;
					}
				}
			}
		}

		return this;
	}

	BCMap.prototype.DrawHospitals = function () {
		this.hospitalsMap = this.mapContianer.select("g.hospitalsMap");

		if (this.hospitalsMap.empty()) {
			this.hospitalsMap = this.mapContianer
				.append("g")
				.classed("hospitalsMap", true);
		}

		if (this.hospitals) {
			for (var i = 0; i < this.hospitals.length; i++) {
				this.DrawHospital(this.hospitals[i]);
			}
		}
		else {
			for (var i = 0; i < regions.length; i++) {
				for (var j = 0; j < regions[i].Hospitals.length; j++) {
					this.DrawHospital(regions[i].Hospitals[j]);
				}
			}
		}

		return this;
	}
	
	BCMap.prototype.DrawHospital = function(hospital) {
		this.hospitalsMap
			.append("circle")
			.attr("cx", this.m2px(hospital.X))
			.attr("cy", this.m2py(hospital.Y))
			.attr("r", 3)
			.attr("stroke", "black")
			.attr("stroke-width", "0px")
			.attr("fill", "black")
			.attr("opacity", "0.6");
	}

	BCMap.prototype.CalculateArcsData = function (hospitalsWaitingTimes) {
		this.arcsList = [];
		var arcPaddingDegree = 6;
		var minValue = 0;
		var totalPaddingDegree = arcPaddingDegree * hospitalsWaitingTimes.length;
		var sumValues = 0;

		for (var i = 0; i < hospitalsWaitingTimes.length ; i++) {
			sumValues = sumValues + hospitalsWaitingTimes[i][this.arcLengthParameter] + minValue;
		}

		hospitalsWaitingTimes.sort(function (a, b) {
			return RegionOrders.indexOf(a.hospital.region) - RegionOrders.indexOf(b.hospital.region);
		});

		var value;
		for (var j = 0; j < hospitalsWaitingTimes.length; j++) {
			value = hospitalsWaitingTimes[j][this.arcLengthParameter];

			if (j == 0) {
				this.arcsList.push({
					startAlfa: 0,
					endAlfa: (value + minValue) / sumValues * (360 - totalPaddingDegree) + 0,
					hospital: hospitalsWaitingTimes[j].hospital,
					WaitingTable: hospitalsWaitingTimes[j]
				});
			}
			else {
				this.arcsList.push({
					startAlfa: this.arcsList[j - 1].endAlfa + arcPaddingDegree,
					endAlfa: (value + minValue) / sumValues * (360 - totalPaddingDegree) + this.arcsList[j - 1].endAlfa + arcPaddingDegree,
					hospital: hospitalsWaitingTimes[j].hospital,
					WaitingTable: hospitalsWaitingTimes[j]
				});
			}
		}

		return this;
	}

	var arcThickness = 30;

	BCMap.prototype.DrawArcs = function (animate) {
		this.mapArcs = this.mapContianer.select("g.mapArcs");

		if (this.mapArcs.empty()) {
			this.mapArcs = this.mapContianer
				.append("g")
				.classed("mapArcs", true);
		}

		//draw arc
		var trDuration = animate ? animationDuration : 0; //duration of my transition...500 miliseconds //if it is true 500 if false, zero, so no animations

		var tip = d3.tip()
					.attr('class', 'd3-tip')
					.offset([-10, 0])
					.html(function (d) {
						return "<span style='color:white; line-height: 150%;'>" + d.hospital.Name + "<br/>Cases Waiting: " + d.WaitingTable.GetWaitingTime() + "<br/> 50% Recieved (weeks): " + d.WaitingTable.GetFiftyWeek() + "<br/> 90% Recieved (weeks): " + d.WaitingTable.GetNinetyWeek() + "</span>";
					});

		this.mapArcs.call(tip);

		var mapArcsData = this.mapArcs
							.selectAll("path")
							.data(this.arcsList);

		var self = this;
		mapArcsData
			.enter()
				.append("path")
				.attr("fill", "transparent")
				.attr("stroke-width", arcThickness)
				.attr("stroke-linecap", "round")
				.on('mouseover', function (d, x, y) { return SelectionManager.SelectRelatives(tip, d, x, y); })
				.on('mouseout', function (d) { return SelectionManager.DeSelectRelatives(tip, d); })
				.on("click", function (d, x, y) {
					var handler = self.OnHospitalClick;
					if (handler)
						handler(d, x, y);
				});

		mapArcsData
			.attr("stroke", function (d, i) {
				return RegionColorMapping.GetColor(d.hospital.region);
			})
			.attr("class", function (d) { return d.hospital.ID; })
			.transition() //for animation changing different counrty when slecting diff options
			.duration(trDuration)
			.delay(function (d, i) { //how long I wait before I start my new animation // i is the index of my data and d is my data... so the data dont move at the same time, each point move by a short delay 
				//from the other point
				return animate ? i * 10 : 0;
			})
			.attr("d", function (d) {
				var sx = Math.cos(d.startAlfa / 360 * 2 * Math.PI) * (self.mapRadius - arcThickness / 2) + self.mapCenter.x;
				var sy = Math.sin(d.startAlfa / 360 * 2 * Math.PI) * (self.mapRadius - arcThickness / 2) + self.mapCenter.y;

				var ex = Math.cos(d.endAlfa / 360 * 2 * Math.PI) * (self.mapRadius - arcThickness / 2) + self.mapCenter.x;
				var ey = Math.sin(d.endAlfa / 360 * 2 * Math.PI) * (self.mapRadius - arcThickness / 2) + self.mapCenter.y;
				var largeArc = (d.endAlfa - d.startAlfa > 180) ? 1 : 0;
				return "M" + ex + "," + ey + " A" + (self.mapRadius - arcThickness / 2) + "," + (self.mapRadius - arcThickness / 2) + " 0 " + largeArc + ",0 " + sx + "," + sy;

			})
			.style("opacity", Offopacity);

		mapArcsData.exit().remove();

		return this;
	}

	BCMap.prototype.linkArc = function (d) {
		var avrAlfa = (d.startAlfa + d.endAlfa) / 2;
		var y = Math.sin(avrAlfa / 360 * 2 * Math.PI) * (this.mapRadius - arcThickness) + this.mapCenter.y;
		var x = Math.cos(avrAlfa / 360 * 2 * Math.PI) * (this.mapRadius - arcThickness) + this.mapCenter.x;
		var dx = this.m2px(d.hospital.X) - x;
		var dy = this.m2py(d.hospital.Y) - y;
		var dr = Math.sqrt(dx * dx + dy * dy);
		return "M" + this.m2px(d.hospital.X) + "," + this.m2py(d.hospital.Y) + "A" + dr + "," + dr + " 0 0,1 " + x + "," + y;
	}

	BCMap.prototype.DrawLinks = function (animate) {
		this.mapLinks = this.mapContianer.select("g.mapLinks");

		if (this.mapLinks.empty()) {
			this.mapLinks = this.mapContianer
				.append("g")
				.classed("mapLinks", true);
		}

		var mapLinksData = this.mapLinks
							  .selectAll("path")
							  .data(this.arcsList);

		var trDuration = animate ? animationDuration : 0;

		mapLinksData.enter()
					.append("path")
					.style("opacity", Offopacity)
					.attr("fill", "transparent")
					.attr("stroke-width", "1px")
					.attr("stroke-dasharray", "10,5");

		var self = this;
		mapLinksData.transition() //for animation changing different counrty when slecting diff options
					.duration(trDuration)
					.delay(function (d, i) { //how long I wait before I start my new animation // i is the index of my data and d is my data... so the data dont move at the same time, each point move by a short delay 
						//from the other point
						if (animate) return i * 10;
						else return 0;
					})
					.attr("d", function (d) { return self.linkArc(d); })
					.attr("class", function (d) { return d.hospital.ID; });


		mapLinksData.exit().remove();

		return this;
	}

	return BCMap;
})();

var DoctorsBarChart = (function () {
	function DoctorsBarChart(settings) {
		this.height = settings.height;
		this.container = settings.container;
		this.barsWidth = settings.barsWidth;

		this.SetWidth(settings.width);

		this.y = d3.scale.linear()
			.range([this.height, 0]);

		this.xAxis = d3.svg.axis()
			.scale(this.x)
			.orient("bottom");

		this.yAxis = d3.svg.axis()
			.scale(this.y)
			.orient("left")
			.ticks(5);
	}

	DoctorsBarChart.prototype.SetWidth = function(w) {
		this.width = w;

		if (this.x) {
			this.x.rangeRoundBands([0, this.width], .1);
		}
		else {
			this.x = d3.scale.ordinal()
				.rangeRoundBands([0, this.width], .1);
		}
	}
	
	DoctorsBarChart.prototype.Data = function (data) {
		data.sort(function (a, b) {
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
					return data.indexOf(a) - data.indexOf(b);
				}
			}
		});

		this.data = data;
	
		return this;
	}
	
	function GetDoctorFirstName(doctor) {
		var nameTrimed = doctor.name.split(",");
		return nameTrimed[0];
	}
	
	function FindRepeatedDoctorNameIndex(waitingTableDoctors, row) {
		var count = 0;
		for (var i = 0 ; i < waitingTableDoctors.length ; i++) {
			if (GetDoctorFirstName(waitingTableDoctors[i].doctor) === GetDoctorFirstName(row.doctor)) {
				count++;
			}
			if (waitingTableDoctors[i] == row) {
				break;
			}
		}
		return count;
	}

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
		var c1 = FindRepeatedDoctorIndex(waitingTableDoctors, d);
		var c2 = FindRepeatedDoctorNameIndex(waitingTableDoctors, d);
		return GetDoctorFirstName(d.doctor).toLowerCase() + Array(c1 + c2).join(" ");
	}

	DoctorsBarChart.prototype.Draw = function () {
		this.chartContainer = this.container.select("g.barChart");
		if (!this.chartContainer.empty()) {
			this.chartContainer.remove();
		}

		this.chartContainer = this.container
			.append("g")
			.classed("barChart", true);
		
		this.tip = d3.tip()
			.attr('class', 'd3-tip')
			.offset([-10, 0])
			.html(function (d) {
				return "<span style='color:white'>" +
					"Doctor: " + d.doctor.name +
					"<br/>Hospital: " + d.hospital.Name +
					"<br/>Cases Waiting: " + d.GetWaitingTime() +
					"<br/>Rating: " + ((d.rating === -1) ? "NA": d.rating) +
					"<br/>50% Received (weeks): " + ((d.fiftyWeek === -1 )? "NA": d.fiftyWeek) +
					"<br/>90% Received (weeks): " + ((d.ninetyWeek === -1) ? "NA" : d.ninetyWeek) +
					
				"</span>";
			});
		
		this.chartContainer.call(this.tip);
		
		this.xAxisGroup = this.chartContainer.append("g")
			.attr("class", "x axis xAxisBar")
			.attr("transform", "translate(0," + this.height + ")")
			.attr("fill", "grey");

		this.yAxisGroup = this.chartContainer.append("g")
			.attr("class", "y axis yAxisBar")
			.attr("fill", "grey");
		
		this.yAxisGroup.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", -36)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("Cases Waiting");

		this.Update(false);
		
		return this;
	}

	function refineYValue(no) {
		return (no === 0) ? 0.3 : no;
	}

	DoctorsBarChart.prototype.Update = function(animate) {
		var trDuration = animate ? animationDuration : 0; //duration of my transition...500 miliseconds //if it is true 500 if false, zero, so no animations

		var self = this;
		this.x.domain(this.data.map(function (d) {
			return DoctorXAxisName(self.data, d);
		}));
		this.y.domain([0, this.maxY ? this.maxY : d3.max(self.data, function (d) { return (d.noWaitingCase); })]);

		this.xAxisGroup.call(this.xAxis)
			.selectAll("text")
				.style("text-anchor", "end")
				.style("font-size", "10px")
				.attr("dx", "-.8em")
				.attr("dy", ".15em")
				.attr("opacity", Offopacity)
				.attr("class", function (d, i) { return self.data[i].hospital.ID; })
				.attr("transform", function (d) {
					return "rotate(-45)"
				});

		this.yAxisGroup.call(this.yAxis);
		
		var self = this;
		
		this.bars = this.chartContainer
			.selectAll("rect")
			.data(this.data);

		this.bars.enter()
			.append("rect")
			.on('mouseover', function (d, x, y) { return SelectionManager.SelectRelatives(self.tip, d, x, y); })
			.on('mouseout', function (d) { return SelectionManager.DeSelectRelatives(self.tip, d); });

		this.bars.transition() //for animation changing different counrty when slecting diff options
			.duration(trDuration)
			.delay(function (d, i) { //how long I wait before I start my new animation // i is the index of my data and d is my data... so the data dont move at the same time, each point move by a short delay 
				//from the other point
				if (animate)
					return i * 10;
				else
					return 0;
			})
			.attr("x", function (d) {
				return self.x(DoctorXAxisName(self.data, d)) + (self.barsWidth ? (self.x.rangeBand() - self.barsWidth) / 2 : 0);
			})
			.attr("width", this.barsWidth ? this.barsWidth : this.x.rangeBand())
			.attr("y", function (d) { return self.y(refineYValue(d.noWaitingCase)); })
			.attr("height", function (d) {
				return self.height - self.y(refineYValue(d.noWaitingCase));
			})
			.attr("class", function (d) { return d.hospital.ID; })
			.style("fill", function (d) {
				return RegionColorMapping.GetColor(d.region);
			}).style("opacity", Offopacity);

		this.bars.exit().remove();

		return this;
	}

	return DoctorsBarChart;
})();

var RadarChart = (function () {
	function RadarChart(settings) {
		this.radius = settings.radius - 45;
		this.center = settings.center;
		this.container = settings.container;
		this.tickCount = settings.tickCount;

		this.radarContainer = null;
	}

	RadarChart.prototype.MetaData = function(metaData) {
		this.metaData = metaData;
		
		return this;
	}

	RadarChart.prototype.Data = function (data) {
		this.data = data;

		return this;
	}

	RadarChart.prototype.Keys = function (keys) {
		this.keysGetter = keys;

		return this;
	}

	RadarChart.prototype.Domain = function (domain) {
		this.domainGetter = domain;

		return this;
	}

	RadarChart.prototype.Draw = function () {
		this.radarContainer = this.container.select("g.radar");
		if (!this.radarContainer.empty()) {
			this.radarContainer.remove();
		}

		this.radarContainer = this.container
			.append("g")
			.classed("radar", true);

		this.Update(false);
		
		return this;
	}

	RadarChart.prototype.Update = function (animate) {
		var trDuration = animate ? animationDuration : 0; //duration of my transition...500 miliseconds //if it is true 500 if false, zero, so no animations
		var alpha = -Math.PI / 2;

		var metaDataCount = this.metaData.length;

		var metaMapper = new Object();
		this.metaData.forEach(function (d, i) {
			metaMapper[d.name] = d;
		});

		var self = this;
		{
			this.xaxesContainer = this.radarContainer.select("g.xaxes");

			if (this.xaxesContainer.empty()) {
				this.xaxesContainer = this.radarContainer
					.append("g")
					.classed("xaxes", true);
			}
			var xaxesData = this.xaxesContainer.selectAll("line").data(this.metaData);
			xaxesData.enter()
				.append("line")
				.attr("x1", this.center.x)
				.attr("y1", this.center.y);

			xaxesData
				.transition()
				.duration(trDuration)
				.attr("x2", function (d, i) { return self.center.x + self.radius * Math.cos(alpha + 2 * Math.PI * i / metaDataCount); })
				.attr("y2", function (d, i) { return self.center.y + self.radius * Math.sin(alpha + 2 * Math.PI * i / metaDataCount); });

			xaxesData.exit().remove();
		}
		{
			this.yaxesContainer = this.radarContainer.select("g.yaxes");
			if (this.yaxesContainer.empty()) {
				this.yaxesContainer = this.radarContainer
					.append("g")
					.classed("yaxes", true);
			}

			var yaxesData = this.yaxesContainer.selectAll("polygon").data(new Array(this.tickCount));

			yaxesData.enter()
				.append("polygon")
				.attr("stroke-dasharray", "5,5")
				.style("fill", "transparent");

			yaxesData
				.transition()
				.duration(trDuration)
				.attr("points", function (d, i) {
					var points = [];
					for (var j = 0; j < self.metaData.length; j++) {
						var x = self.center.x + (i + 1) * self.radius / self.tickCount * Math.cos(alpha + 2 * Math.PI * j / metaDataCount);
						var y = self.center.y + (i + 1) * self.radius / self.tickCount * Math.sin(alpha + 2 * Math.PI * j / metaDataCount);
						points.push(x + "," + y);
					}

					return points.join(' ');
				});

			yaxesData.exit().remove();
		}
		{
			this.series = this.radarContainer.select("g.series");
			if (this.series.empty()) {
				this.series = this.radarContainer
					.append("g")
					.classed("series", true);
			}

			var seriesData = this.series.selectAll("polygon").data(this.data);
			seriesData.enter()
				.append("polygon");

			seriesData
				.transition()
				.duration(trDuration)
				.attr("points", function (d) {
					var points = [];
					for (var j = 0; j < self.metaData.length; j++) {
						var val = d[self.keysGetter(self.metaData[j])];
						var domain = self.domainGetter(metaMapper[self.keysGetter(self.metaData[j])]);

						var scaledVal = (val - domain[0]) / (domain[1] - domain[0]);

						var x = self.center.x + scaledVal * self.radius * Math.cos(alpha + 2 * Math.PI * j / metaDataCount);
						var y = self.center.y + scaledVal * self.radius * Math.sin(alpha + 2 * Math.PI * j / metaDataCount);
						points.push(x + "," + y);
					}

					return points.join(' ');
				})
				.attr("class", function (d) { return d.hospital.ID; })
				.style("fill", function (d) {
					return RegionColorMapping.GetColor(d.region);
				})
				.style("opacity", Offopacity)
				//.style("fill", function (d) { return d.fill; })
				.attr("stroke", function (d) { return d.stroke; });

			seriesData.exit().remove();
		}
		{
			this.xAxisLabels = this.radarContainer.select("g.xaxisLabels");
			if (this.xAxisLabels.empty()) {
				this.xAxisLabels = this.radarContainer
					.append("g")
					.classed("xaxisLabels", true);
			}

			var xAxisLabelsData = this.xAxisLabels.selectAll("text").data(this.metaData);
			xAxisLabelsData.enter()
				.append("text")
				.attr("alignment-baseline", "middle")
				.attr("text-anchor", "middle");

			var x = function (d, i) { return self.center.x + (self.radius + 40) * Math.cos(alpha + 2 * Math.PI * i / metaDataCount); }
			var y = function (d, i) { return self.center.y + (self.radius + 40) * Math.sin(alpha + 2 * Math.PI * i / metaDataCount); }

			xAxisLabelsData
				.transition()
				.duration(trDuration)
				.attr("x", x)
				.attr("y", y)
				.attr("transform", function (d, i) {
					return "rotate(" + (90 + (alpha * 180 / Math.PI) + 360 * i / metaDataCount) + "," + x(d, i) + "," + y(d, i) + ")";
				})
				.text(function (d) { return d.name; });

			xAxisLabelsData.exit().remove();
		}
		{
			this.yAxisLabels = this.radarContainer.select("g.yaxisLabels");
			if (this.yAxisLabels.empty()) {
				this.yAxisLabels = this.radarContainer
					.append("g")
					.classed("yaxisLabels", true);
			}
			else {
				this.yAxisLabels.selectAll("*").remove();
			}

			for (var i = 1; i <= this.tickCount; i++) {
				for (var j = 0; j < this.metaData.length; j++) {
					var x = this.center.x + (i * this.radius / this.tickCount + 5) * Math.cos(alpha + 2 * Math.PI * j / metaDataCount);
					var y = this.center.y + (i * this.radius / this.tickCount + 5) * Math.sin(alpha + 2 * Math.PI * j / metaDataCount);
					var domain = this.domainGetter(this.metaData[j]);

					var t = this.yAxisLabels.append("text")
						.attr("x", x)
						.attr("y", y)
						.attr("alignment-baseline", "middle")
						.attr("transform", function (d, i) {
							return "rotate(" + (90 + (alpha * 180 / Math.PI) + 360 * j / metaDataCount) + "," + x + "," + y + ")";
						})
						.text(Math.round((domain[0] + (domain[1] - domain[0]) * i / this.tickCount) * 100) / 100);
				}
			}
		}
		
		return this;
	}

	return RadarChart;
})();