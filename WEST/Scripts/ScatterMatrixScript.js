var scatterMatrix = {};
var ScatterCircleR = 3;
var factors = ["rating", "noWaitingCase", "fiftyWeek", "ninetyWeek"];
var factorNames = ["Rating", "No Waiting Cases", "Fifty Weeks", "Ninety Weeks"];
var factorFilters = {
	rating: function (d) { return (d.rating !== -1 && d.rating !== 25); },
	noWaitingCase: function (d) { return d.noWaitingCase > 2.5; },
	fiftyWeek: function (d) { return d.fiftyWeek !== -1; },
	ninetyWeek: function (d) { return d.ninetyWeek !== -1; }
};

function CreateScatterMatrix() {
	scatterMatrix.cellPadding = 12;
	scatterMatrix.margin = { top: 40, right: 20, bottom: 0, left: WidthLeft + WidthMiddle };
	scatterMatrix.padding = { top: 30, left: 0, right: 30, bottom: 20 };
	scatterMatrix.width = Math.round((WidthRight - scatterMatrix.padding.left - scatterMatrix.padding.right) / 3) * 3;
	scatterMatrix.height = Math.round((HeightUp - scatterMatrix.padding.top - scatterMatrix.padding.bottom) / 3) * 3;
	scatterMatrix.sizeX = (scatterMatrix.width - 2 * scatterMatrix.cellPadding) / 3;
	scatterMatrix.sizeY = (scatterMatrix.height - 2 * scatterMatrix.cellPadding) / 3;


	scatterMatrix.x = d3.scale.linear()
		.range([scatterMatrix.cellPadding / 2, scatterMatrix.sizeX - scatterMatrix.cellPadding / 2]);

	scatterMatrix.y = d3.scale.linear()
		.range([scatterMatrix.sizeY - scatterMatrix.cellPadding / 2, scatterMatrix.cellPadding / 2]);


	scatterMatrix.xAxis = d3.svg.axis()
		.scale(scatterMatrix.x)
		.orient("bottom")
		.ticks(5);

	scatterMatrix.yAxis = d3.svg.axis()
		.scale(scatterMatrix.y)
		.orient("left")
		.ticks(5);

	scatterMatrix.element = d3.select("#ScatterPlotMatrix")
					.attr("transform", "translate(" + (scatterMatrix.margin.left + scatterMatrix.padding.left) + "," + (scatterMatrix.margin.top + scatterMatrix.padding.top) + ")");

	scatterMatrix.element.append("text")
		.attr("x", (scatterMatrix.width / 2))
		.attr("y", 0 - (scatterMatrix.margin.top / 2) - 10)
		.attr("text-anchor", "middle")
		.style("font-size", "16px")
		.style("font-weight", "bold")
		.text("Relationship between the Waiting Time, Queue Length and Rating");


	scatterMatrix.element.append("text")
		.attr("x", (scatterMatrix.width / 3) + 35)
		.attr("y", scatterMatrix.height - 35)
		.attr("text-anchor", "right")
		.style("font-size", "11px")
		.text("* Fifty Weeks: No. of weeks that 50% of patients had their surgery.");

	scatterMatrix.element.append("text")
		.attr("x", (scatterMatrix.width / 3) + 35)
		.attr("y", scatterMatrix.height - 10)
		.attr("text-anchor", "left")
		.style("font-size", "11px")
		.text("* Ninety Weeks: No. of weeks that 90% of patients had their surgery.");

	for (var i = 0; i < factors.length - 1; i++) {
		var f = factors[i];
		var cx = scatterMatrix.width * (factors.length - i - 1) / (factors.length - 1) + 10;
		var cy = (scatterMatrix.height / (factors.length - 1)) * (i + 0.5);
		scatterMatrix.element.append("text")
			.attr("x", cx)
			.attr("y", cy)
			.attr("text-anchor", "middle")
			.style("font-size", "14px")
			.attr("transform", "rotate(90," + cx + "," + cy + ")")
			.text(factorNames[i]);
	}

	for (var i = 1; i < factors.length; i++) {
		var f = factors[i];
		var cx = (scatterMatrix.width / (factors.length - 1)) * (factors.length - i - 0.5);
		var cy = -(scatterMatrix.margin.top / 2) + 10;
		scatterMatrix.element.append("text")
			.attr("x", cx)
			.attr("y", cy)
			.attr("text-anchor", "middle")
			.style("font-size", "14px")
			.text(factorNames[i]);
	}
}

function UpdateScatterMatrix(WaitingArray, dataType, animate) {
	var trDuration = animate ? animationDuration : 0; //duration of my transition...500 miliseconds //if it is true 500 if false, zero, so no animations
	var factorsDomains = {};
	var factorTicks = {};
	factors.forEach(function (f) {
		if (f == "rating") {
			factorsDomains[f] = (dataType === "Doctors") ? [1, 5] : [0, 25];
		}
		else {
			factorsDomains[f] = d3.extent(WaitingArray.filter(factorFilters[f]), function (d) { return d[f]; });
		}
		factorTicks[f] = [];
		var tickCount = 5;
		for (var i = 0; i < tickCount; i++) {
			var start = factorsDomains[f][0];
			var end = factorsDomains[f][1];
			factorTicks[f][i] = (end - start) / (tickCount - 1) * i + start;
		}
	});

	var scatterMatrixXAxisData = scatterMatrix.element.selectAll(".xAxis")
		.data(factors.filter(function (d, i) {
			return (i > 0);
		}));
	
	scatterMatrixXAxisData
		.enter()
		.append("g")
			.attr("class", "x axis xAxis");
	 
	scatterMatrixXAxisData
		.attr("transform", function (d, i) { return "translate(" + (factors.length - i - 2) * (scatterMatrix.sizeX + scatterMatrix.cellPadding) + ",0)"; })
		.each(function (d, i) {
			scatterMatrix.xAxis.tickSize((scatterMatrix.sizeY + scatterMatrix.cellPadding) * (i + 1) - scatterMatrix.cellPadding);
			scatterMatrix.xAxis.tickValues(factorTicks[d]);
			scatterMatrix.x.domain(factorsDomains[d]);
			d3.select(this).call(scatterMatrix.xAxis);
		});

	var scatterMatrixYAxisData = scatterMatrix.element.selectAll(".yAxis")
		.data(factors.filter(function (d, i) {
			return (i < factors.length - 1)
		}));
	scatterMatrixYAxisData
		.enter()
		.append("g")
			.attr("class", "y axis yAxis");
	
	scatterMatrixYAxisData
		.attr("transform", function (d, i) { return "translate(0," + i * (scatterMatrix.sizeY + scatterMatrix.cellPadding) + ")"; })
		.each(function (d, i) {
			scatterMatrix.yAxis.tickSize(-(scatterMatrix.sizeX + scatterMatrix.cellPadding) * (factors.length - i - 1) + scatterMatrix.cellPadding);
			scatterMatrix.yAxis.tickValues(factorTicks[d]);
			scatterMatrix.y.domain(factorsDomains[d]);
			d3.select(this).call(scatterMatrix.yAxis);
		});


	var cellData = scatterMatrix.element.selectAll(".cell")
		  .data(cross(factors, factors));
	
	cellData.enter().append("g")
		  .attr("class", "cell");
	
	var cell = cellData
		  .attr("transform", function (d) {
		  	return "translate(" + (factors.length - d.i - 1) * (scatterMatrix.sizeX + scatterMatrix.cellPadding) + "," + d.j * (scatterMatrix.sizeY + scatterMatrix.cellPadding) + ")";
		  })
		  .each(plot);

	// Titles for the diagonal.
	cell.filter(function (d) { return d.i === d.j; })
	.append("text")
		.attr("x", scatterMatrix.cellPadding)
		.attr("y", scatterMatrix.cellPadding)
		.attr("dy", ".71em")
		.text(function (d) { return d.x; });

	function plot(p) {
		var cell = d3.select(this);

		scatterMatrix.x.domain(factorsDomains[p.x]);
		scatterMatrix.y.domain(factorsDomains[p.y]);

		cell.append("rect")
			.attr("class", "frame")
			.attr("x", scatterMatrix.cellPadding / 2)
			.attr("y", scatterMatrix.cellPadding / 2)
			.attr("width", scatterMatrix.sizeX - scatterMatrix.cellPadding)
			.attr("height", scatterMatrix.sizeY - scatterMatrix.cellPadding);

		var cellData = cell.selectAll("circle")
			.data(WaitingArray.filter(factorFilters[p.x]).filter(factorFilters[p.y]));

		cellData.enter()
				.append("circle");
		
		cellData
			.transition() //for animation changing different counrty when slecting diff options
			.attr("class", function (d) { return d.hospital.ID; })
			.duration(trDuration)
			.attr("cx", function (d) { return scatterMatrix.x(d[p.x]); })
			.attr("cy", function (d) { return scatterMatrix.y(d[p.y]); })
			.attr("r", ScatterCircleR)
			.style("fill", function (d) { return RegionColorMapping.GetColor(d.region); })
			.style("opacity", Offopacity);

		cellData.exit().remove();
	}

	function cross(a, b) {
		var c = [], n = a.length, m = b.length, i, j;
		for (i = 0; i < n; i++) {
			for (j = 0; j < i; j++)
				c.push({ x: a[i], i: i, y: b[j], j: j });
		}
		return c;
	}

}