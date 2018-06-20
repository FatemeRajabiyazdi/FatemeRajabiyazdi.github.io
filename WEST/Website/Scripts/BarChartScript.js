
$(document).ready(function () {
	
	var t = 0;
	
	function createBarChart() {
		var barChartmargin = { top: HeightUp, right: 70, bottom: 60, left: 70 },
				width = windowWidth - barChartmargin.right - barChartmargin.left,
				height = windowHeight - barChartmargin.top - barChartmargin.bottom;

		//Data filling
		x_scale.domain([waitingTableHospitals.map(function (d) { return d.hospital.Name; })]);
		y_scale.domain([0, d3.max(waitingTableHospitals, function (d) { return (d.noWaitingCase) / 10; })]);


		root = d3.select("#Overview").append("g")
				.attr("width", width + barChartmargin.left + barChartmargin.right)
				.attr("height", height + barChartmargin.top + barChartmargin.bottom)
				.append("g")
				.attr("transform", "translate(" + barChartmargin.left + "," + barChartmargin.top + ")");


		root.append("g")
			.attr("class", "xAxis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis)
			.append("text")
				.attr("class", "label")
				.attr("x", width)
				.attr("y", -6)


		root.append("g")
			.attr("class", "yAxis")
			.call(yAxis)
			.append("text")
				.attr("class", "label")
				.attr("transform", "rotate(-90)")
				.attr("y", 6)
				.attr("dy", ".71em")
				.style("text-anchor", "end");

	}

});
