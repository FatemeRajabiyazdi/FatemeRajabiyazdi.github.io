function createScatterPlot() {
	scatter1 = d3.select("#ScatterPlot1").append("g")
		.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("transform", "translate(" + (margin.left + padding.left) + "," + (margin.top + padding.top) + ")");

	scatter1.append("rect")
		.attr({
			class: "background",
			width: width,
			height: height
		}).style({
			fill: "transparent"
		});

	scatter1.append("g")
		.attr("class", "xAxis axis")
		.attr("transform", "translate(0," + height + ")")
		.attr("fill", "gray")
		.call(xAxis)
		.append("text")
			.attr("class", "label")
			.attr("fill", "gray")
			.attr("x", width)
			.attr("y", 35)
			.style("text-anchor", "end");


	scatter1.append("g")
		.attr("class", "yAxis axis")
		.attr("fill", "gray")
		.call(yAxis)
		.append("text")
			.attr("class", "label")
			.attr("fill", "gray")
			.attr("transform", "rotate(-90)")
			.attr("y", -40)
			.attr("dy", ".71em")
			.style("text-anchor", "end");


	//////////////////////////////////////////////////////////////////////////////////////////////////////////
	scatter2 = d3.select("#ScatterPlot2").append("g")
		.attr("width", width2)
		.attr("height", height2)
		.append("g")
		.attr("transform", "translate(" + (margin2.left + padding2.left) + "," + (margin2.top + padding2.top) + ")");

	scatter2.append("rect")
		.attr({
			class: "background",
			width: width2,
			height: height2
		}).style({
			fill: "transparent"
		});

	scatter2.append("g")
		.attr("class", "xAxis2 axis2")
		.attr("transform", "translate(0," + height2 + ")")
		.attr("fill", "gray")
		.call(xAxis)
		.append("text")
			.attr("class", "label")
			.attr("fill", "gray")
			.attr("x", width2)
			.attr("y", 35)
			.style("text-anchor", "end");


	scatter2.append("g")
		.attr("class", "yAxis2 axis2")
		.attr("fill", "gray")
		.call(yAxis)
		.append("text")
			.attr("class", "label")
			.attr("fill", "gray")
			.attr("transform", "rotate(-90)")
			.attr("y", -40)
			.attr("dy", ".71em")
			.style("text-anchor", "end");


}

function UpdateScatter1(animate, waitingArrayList) { //if there is animate or not		

	var defaultDomainX = [0, d3.max(waitingArrayList, function (d) { return d.fiftyWeek + 2; })];
	var defaultDomainY = [0, d3.max(waitingArrayList, function (d) { return d.ninetyWeek; })];
	x_scale.domain([0, d3.max(waitingArrayList, function (d) { return d.fiftyWeek + 2; })]);
	y_scale.domain([0, d3.max(waitingArrayList, function (d) { return d.ninetyWeek; })]);


	size_scale.domain([0, d3.max(waitingArrayList, function (d) { return d.noWaitingCase; })]);

	var trDuration = animate ? 500 : 0; //duration of my transition...500 miliseconds //if it is true 500 if false, zero, so no animations

	var tip = d3.tip()
		  .attr('class', 'd3-tip')
		  .offset([-10, 0])
		  .html(function (d) {
		  	return "<strong> </strong> <span style='color:white'>" + d.hospital.Name + "</span>";
		  });

	scatter1.call(tip);

	//brush
	var brush = d3.svg.brush()
					.x(x_scale)
					.y(y_scale)
					//.extent([[100, 100], [200, 200]])
					.on("brushend", brushed);

	function brushed() {
		var extent = brush.extent();

		x_scale.domain(brush.empty() ? defaultDomainX : [extent[0][0], extent[1][0]]);
		y_scale.domain(brush.empty() ? defaultDomainY : [extent[0][1], extent[1][1]]);
		scatter1.selectAll("circle")
			.attr("cx", function (d) { return x_scale(d.fiftyWeek); })
			.attr("cy", function (d) { return y_scale(d.ninetyWeek); });
		scatter1.select(".xAxis").call(xAxis);
		scatter1.select(".yAxis").call(yAxis);

		scatter1.call(tip);
		//*
		d3.selectAll(".scatterBrush rect:not(.background)")
			.attr("width", 0)
			.attr("height", 0);
		//*/
	}

	scatter1.append("defs")
			.append("clipPath")
			.attr("id", "clip")
			.append("rect")
			.attr("width", width)
			.attr("height", height);


	scatter1.append("g")
			 .attr("class", "scatterBrush")
			 .call(brush)
			 .selectAll("rect");

	var scatter11 = d3.select("#ScatterPlot1 > g > g")
					.selectAll("circle")
					.data(waitingArrayList);


	scatter11.enter()
		.append("circle")
		.style("opacity", Offopacity)
		.style("stroke", "black")
		.style("stroke-width", 0)
		.on('mouseover', function (d, x, y) { return SelectRelatives(tip, d, x, y); })
		.on('mouseout', function (d) { return DeSelectRelatives(tip, d); });


	scatter11.transition() //for animation changing different counrty when slecting diff options
		.duration(trDuration)
		.delay(function (d, i) { //how long I wait before I start my new animation // i is the index of my data and d is my data... so the data dont move at the same time, each point move by a short delay 
			//from the other point
			if (animate) return i * 10;
			else return 0;
		})
	   .attr("cx", function (d) { return x_scale(d.fiftyWeek); })
	   .attr("cy", function (d) { return y_scale(d.ninetyWeek); })
		.attr("class", function (d) { return d.hospital.ID; })
		.style("fill", function (d) {
			return getColor(d.region);
		})
		.attr("r",
			function (d) {
				return size_scale(d.noWaitingCase);
			}
		);

	xAxis.scale(x_scale);
	yAxis.scale(y_scale);

	scatter1.select(".xAxis").call(xAxis)
		.select(".label").text("50% received surgery in weeks");
	scatter1.select(".yAxis").call(yAxis)
		.select(".label").text("90% received surgery in weeks");

	scatter11.exit().remove();


}

function UpdateScatter2(animate, waitingArrayList) {

	var defaultDomainX = [0, d3.max(waitingArrayList, function (d) { return d.fiftyWeek; })];
	var defaultDomainY = [0, d3.max(waitingArrayList, function (d) { return d.ninetyWeek; })];
	x_scale2.domain([0, d3.max(waitingArrayList, function (d) { return d.fiftyWeek; })]);
	y_scale2.domain([0, d3.max(waitingArrayList, function (d) { return d.ninetyWeek; })]);

	size_scale2.domain([0, d3.max(waitingArrayList, function (d) { return Math.pow(d.rating, 4); })]);


	var trDuration = animate ? 500 : 0; //duration of my transition...500 miliseconds //if it is true 500 if false, zero, so no animations

	var tip = d3.tip()
		  .attr('class', 'd3-tip')
		  .offset([-10, 0])
		  .html(function (d) {
		  	return "<strong> </strong> <span style='color:white'>" + d.hospital.Name + "</span>";
		  });

	scatter2.call(tip);

	//brush
	var brush = d3.svg.brush()
					.x(x_scale2)
					.y(y_scale2)
					//.extent([[100, 100], [200, 200]])
					.on("brushend", brushed);

	function brushed() {
		var extent = brush.extent();

		x_scale2.domain(brush.empty() ? defaultDomainX : [extent[0][0], extent[1][0]]);
		y_scale2.domain(brush.empty() ? defaultDomainY : [extent[0][1], extent[1][1]]);
		scatter2.selectAll("circle")
			.attr("cx", function (d) { return x_scale2(d.fiftyWeek); })
			.attr("cy", function (d) { return y_scale2(d.ninetyWeek); });
		scatter2.select(".xAxis2").call(xAxis2);
		scatter2.select(".yAxis2").call(yAxis2);

		scatter2.call(tip);
		//*
		d3.selectAll(".scatterBrush rect:not(.background)")
			.attr("width", 0)
			.attr("height", 0);
		//*/
	}

	scatter2.append("defs")
			.append("clipPath")
			.attr("id", "clip")
			.append("rect")
			.attr("width", width2)
			.attr("height", height2);


	var scatter12 = d3.select("#ScatterPlot2 > g > g")
					.selectAll("circle")
					.data(waitingArrayList);

	scatter2.append("g")
	 .attr("class", "scatterBrush")
	 .call(brush)
	 .selectAll("rect");

	scatter12.enter()
		.append("circle")
		.style("opacity", Offopacity)
		.style("stroke", "black")
		.style("stroke-width", 0)
		.on('mouseover', function (d, x, y) { return SelectRelatives(tip, d, x, y); })
		.on('mouseout', function (d) { return DeSelectRelatives(tip, d); });


	scatter12.transition() //for animation changing different counrty when slecting diff options
		.duration(trDuration)
		.delay(function (d, i) { //how long I wait before I start my new animation // i is the index of my data and d is my data... so the data dont move at the same time, each point move by a short delay 
			//from the other point
			if (animate) return i * 10;
			else return 0;
		})
	   .attr("cx", function (d) { return x_scale2(d.fiftyWeek); })
	   .attr("cy", function (d) { return y_scale2(d.ninetyWeek); })
		.attr("class", function (d) { return d.hospital.ID; })
		.style("fill", function (d) {
			return getColor(d.region);
		})
		.attr("r", function (d) {
			return size_scale2(Math.pow(d.rating, 4));
		});

	xAxis2.scale(x_scale2);
	yAxis2.scale(y_scale2);

	scatter2.select(".xAxis2").call(xAxis2)
		.select(".label").text("50% received surgery in weeks");
	scatter2.select(".yAxis2").call(yAxis2)
		.select(".label").text("90% received surgery in weeks");

	scatter12.exit().remove();


}