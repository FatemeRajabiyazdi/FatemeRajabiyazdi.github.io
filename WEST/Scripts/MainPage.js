var windowWidth;
var windowHeight;

var barChartMargin;

var ScaleLeft = 0.4;
var ScaleMiddle = 1.2;
var ScaleRight = 1.1;
var WidthLeft;
var WidthRight;
var WidthMiddle;

var ScaleUp = 2.8;
var ScaleDown = 1;
var HeightUp;
var HeightDown;

var waitingTableHospitals = [];
var waitingTableDoctors = [];

var populationData = [{ region: Interior, population: 0.730712 }, { region: Fraser, population: 1.706824 }, { region: VanC, population: 1.146312 }, { region: VanI, population: 0.759725 }, { region: Northern, population: 0.287729 }];
var houseHoldData = [{ region: Interior, houseHold: 314.316 }, { region: Fraser, houseHold: 631.863 }, { region: VanC, houseHold: 483.532 }, { region: VanI, houseHold: 338.575 }, { region: Northern, houseHold: 116.545 }];

$(document).ready(function () {
	windowWidth = $(window).width() - 20;
	windowHeight = ($(window).height());

	WidthLeft = (windowWidth * ScaleLeft) / (ScaleLeft + ScaleRight + ScaleMiddle);
	WidthRight = (windowWidth * ScaleRight) / (ScaleLeft + ScaleRight + ScaleMiddle);
	WidthMiddle = (windowWidth * ScaleMiddle) / (ScaleLeft + ScaleRight + ScaleMiddle);

	HeightUp = (windowHeight * ScaleUp) / (ScaleUp + ScaleDown);
	HeightDown = (windowHeight * ScaleDown) / (ScaleUp + ScaleDown);

	BCBorder = { X: WidthLeft + WidthMiddle / 2, Y: HeightUp / 2 + 50, R: Math.min(WidthMiddle / 2.2, HeightUp / 2.2) }; //object

	d3.select("#Overview")
		.attr("width", windowWidth)
		.attr("height", windowHeight);

	CreateButtons();

	CreateScatterMatrix();
	UpdateScatterMatrix(waitingTableDoctors, "Doctors", false);

	d3.select("#Overview").append("text")
		.attr("x", BCBorder.X)
		.attr("y", 40)
		.attr("text-anchor", "middle")
		.style("font-size", "16px")
		.style("font-weight", "bold")
		.text("Click on the Arcs to Compare Hospitals");

	var bcMap = new BCMap({
		container: d3.select("#Overview #Map"),
		mapCenter: { x: BCBorder.X, y: BCBorder.Y },
		mapRadius: BCBorder.R,
		arcLengthParameter: "noWaitingCase"
	})
	.CalculateArcsData(waitingTableHospitals)
	.Draw(false);
	
	var selectionPanel = d3.select("#Overview #SelectionPanel #items")
		.attr("transform", "translate(20,450)");
	var selectedHospitals = [];
	
	function UnselectHospitals() {
		selectedHospitals = [];
		selectionPanel.selectAll("g").remove();
		d3.select("#Overview #SelectionPanel #BtnCompare")
			.style("visibility", "hidden");
	}

	bcMap.OnHospitalClick = function (d, x, y) {
		var hIndex = selectedHospitals.indexOf(d.hospital);
		if (hIndex === -1) {
			selectedHospitals.push(d.hospital);
		}
		else {
			selectedHospitals.splice(hIndex, 1);
		}
		
		var selectionPanelData = selectionPanel.selectAll("g")
			.data(selectedHospitals);
		var selectionPanelGroup = selectionPanelData.enter()
			.append("g");
		
		//selectionPanelGroup.append("text");
		//selectionPanelGroup.append("rect");
		
		selectionPanelGroup
			.on('mouseover', function (d, x, y) { return SelectionManager.SelectRelatives(null, d, x, y); })
			.on('mouseout', function (d) { return SelectionManager.DeSelectRelatives(null, d); })
			.attr("transform", function (d, i) { return "translate(0," + i * 18 + ")" });
		
		selectionPanelData.selectAll("*").remove();
		
		selectionPanelData.append("text")
			.attr("class", function (d) { return d.ID + " selectedHospital"; })
			.attr("opacity", Offopacity)
			.text(function(d) {
				if (d.Name.length > 30) {
					return d.Name.substring(0, 27) + "...";
				};
				return d.Name;
			})
			.attr("x", 20)
			.attr("y", 5);

		selectionPanelData.append("rect")
			.attr("class", function (d) { return d.ID; })
			.attr("opacity", Offopacity)
			.attr("fill", function(d) { return RegionColorMapping.GetColor(d.region); })
			.attr("x", 0)
			.attr("y", -5)
			.attr("width", 10)
			.attr("height", 10);
		
		selectionPanelData.exit().remove();
		
		d3.select("#Overview #SelectionPanel #BtnCompare")
			.style("visibility", "visible")
			.attr("transform", "translate(20," + (450 + selectedHospitals.length * 20 - 5) + ")");
	}

	SetupMapColorSelector();

	SetupArcsValueSelector();

	barChartMargin = { top: HeightUp + 50, right: 70, bottom: 100, left: 70 };
	
	d3.select("#Overview #BarChart")
		.attr("transform", "translate(" + barChartMargin.left + "," + barChartMargin.top + ")");

	var allDocsBarChart = new DoctorsBarChart({
		container: d3.select("#Overview #BarChart"),
		width: WidthLeft + WidthRight + WidthMiddle - barChartMargin.right - barChartMargin.left,
		height: HeightDown - barChartMargin.bottom
	})
	.Data(waitingTableDoctors)
	.Draw();

	var svg = d3.select("#Comparison")
		.attr("width", windowWidth)
		.attr("height", windowHeight);

	var hospitalsWaitingTimes;
	var doctorsWaitingTimes;

	var selectedHospitalsWaiting;
	var waitingTimeRange;
	var nintyRange;
	var fiftyRange;
	var eachBarWidth;
	var radarData;
	var radarMetaData;
	
	function CalculateComparisionData() {
		selectedHospitalsWaiting = waitingTableHospitals.filter(function (d) { return selectedHospitals.indexOf(d.hospital) !== -1; });
		waitingTimeRange = [0, d3.max(selectedHospitalsWaiting, function(d) { return d.noWaitingCase; })];
		nintyRange = [0, d3.max(selectedHospitalsWaiting, function(d) { return d.ninetyWeek; })];
		fiftyRange = [0, d3.max(selectedHospitalsWaiting, function(d) { return d.fiftyWeek; })];
		eachBarWidth = (WidthLeft + WidthRight + WidthMiddle - barChartMargin.right - barChartMargin.left) / selectedHospitals.length - 50;
		radarData = selectedHospitalsWaiting.map(function (d, i) {
			return {
				"Cases Waiting": d.noWaitingCase,
				"90%": d.ninetyWeek,
				"50%": d.fiftyWeek,
				region: d.region,
				hospital: d.hospital,
				fill: "url(#pattern" + i + ")",//"rgba(0, 255, 0, 0.5)",
				stroke: "green"
			};
		});
		radarMetaData = [
			{ name: "Cases Waiting", max: waitingTimeRange[1], min: waitingTimeRange[0] },
			{ name: "90%", max: nintyRange[1], min: nintyRange[0] },
			{ name: "50%", max: fiftyRange[1], min: fiftyRange[0] }
		];
	}
	var bcMapCompare = null;
	var radar = null;
	var docsBarCharts = [];
	var barsWidth;
	var maxBarValue;
	function CalculateCompareBarChartSettings() {
		barsWidth = d3.min(docsBarCharts, function (chart) { return chart.x.rangeBand(); });
		maxBarValue = d3.max(docsBarCharts, function (chart) { return chart.y.domain()[1]; });
	}
	
	d3.select("#BtnCompare").on("click", function () {
		d3.select("#Comparison").style("display", "inherit");
		selectedHospitals = selectedHospitals;
		window.scrollTo(0, document.body.scrollHeight);

		CalculateComparisionData();

		if (bcMapCompare === null) {
			bcMapCompare = new BCMap({
				container: svg.append("g").attr("transform", "translate(0, 0)"),
				mapCenter: { x: BCBorder.X, y: BCBorder.Y },
				mapRadius: BCBorder.R,
				arcLengthParameter: "noWaitingCase",
				hospitals: selectedHospitals
			})
			.CalculateArcsData(selectedHospitalsWaiting)
			.Draw(false);
		}
		else {
			bcMapCompare
				.CalculateArcsData(selectedHospitalsWaiting)
				.DrawLinks(true)
				.DrawArcs(true);
		}

		if (radar === null) {
			radar = new RadarChart({
				container: svg.append("g").classed("radar", true).attr("transform", "translate(" + scatterMatrix.margin.left + "," + scatterMatrix.margin.top + ")"),
				radius: Math.min(scatterMatrix.width, scatterMatrix.height) / 2,
				center: {
					x: scatterMatrix.width / 2,
					y: scatterMatrix.height / 2
				},
				tickCount: 4
			})
			.MetaData(radarMetaData)
			.Data(radarData)
			.Keys(function (d) { return d.name; })
			.Domain(function (d) { return [d.min, d.max]; })
			.Draw();
		}
		else {
			radar
				.MetaData(radarMetaData)
				.Data(radarData)
				.Update(true);
		}

		var labelsContainer = svg.select("g.barChartLabels");
		if (labelsContainer.empty()) {
			labelsContainer = svg.append("g").classed("barChartLabels", true);
		}

		var labels = labelsContainer.selectAll("text")
			.data(selectedHospitals);

		labels.enter().append("text")
			.attr("y", barChartMargin.top - 10)
			.attr("text-anchor", "middle");

		labels
			.attr("x", function (d, i) { return (eachBarWidth + 50) * (i + 0.5) + barChartMargin.left; })
			.text(function (d) { return d.Name; });

		labels.exit().remove();

		var docsBarContainer = svg.select("g.docsBar");
		if (docsBarContainer.empty()) {
			docsBarContainer = svg.append("g").classed("docsBar", true)
		}

		var docsBarData = docsBarContainer.selectAll("g.docBar").data(selectedHospitals);
		docsBarData.enter().append("g")
			.classed("docBar", true)
			.each(function (d, i) {
			var docsBarChart = new DoctorsBarChart({
				container: d3.select(this),
				width: eachBarWidth,
				height: HeightDown - barChartMargin.bottom,
			})
			.Data(waitingTableDoctors.filter(function (d) { return selectedHospitals.indexOf(d.hospital) === i; }))
			.Draw();

			docsBarCharts.push(docsBarChart);
		});

		docsBarData.attr("transform", function (d, i) { return "translate(" + ((eachBarWidth + 50) * i + barChartMargin.left) + "," + barChartMargin.top + ")"; });

		docsBarData.exit().remove();
		if (docsBarCharts.length > selectedHospitals.length) {
			docsBarCharts.splice(selectedHospitals.length, docsBarCharts.length - selectedHospitals.length);
		}

		docsBarCharts.forEach(function (chart, i) {
			chart.SetWidth(eachBarWidth);
			if (chart.barsWidth) {
				chart.barsWidth = undefined;
				chart.maxY = undefined;
				chart.Data(waitingTableDoctors.filter(function (d) { return selectedHospitals.indexOf(d.hospital) === i; }))
					.Update(true);
			}
		});

		CalculateCompareBarChartSettings();

		docsBarCharts.forEach(function (chart) {
			chart.barsWidth = barsWidth;
			chart.maxY = maxBarValue;
			chart.Update(true);
		});
	});

	function SetupMapColorSelector() {
		d3.selectAll("#mapColorType input")
			.on("click", function () {
				if (this.value == "population") {
					BCMap.GetColor = RegionColorMapping.GetColorPopulation;
				}
				if (this.value == "households") {
					BCMap.GetColor = RegionColorMapping.GetColorHouseHold;
				}
				if (this.value == "colored") {
					BCMap.GetColor = RegionColorMapping.GetColor;
				}

				bcMap.Draw(false);
			});
	}

	function SetupArcsValueSelector() {
		d3.selectAll("#mapValueType input")
			.on("click", function () {
				if (this.value == "caseWaiting") {
					bcMap.arcLengthParameter = "noWaitingCase";
				}
				if (this.value == "fiftyPercent") {
					bcMap.arcLengthParameter = "fiftyWeek";
				}
				if (this.value == "nintyPercent") {
					bcMap.arcLengthParameter = "ninetyWeek";
				}

				bcMap.CalculateArcsData(waitingTableHospitals);
				bcMap.DrawArcs(true);
				bcMap.DrawLinks(true);
			});
	}

	function CreateButtons() {
		var scatterOption = ["Doctors", "Hospitals"];

		var buttonGroups = d3.select("#surgeriesList");
		var buttonScatter = d3.select("#ScatterInteraction");
		
		buttonGroups.append("label").html("Surgery:").style("margin-right", "10px").style("margin-left", "10px");
		buttonScatter.append("label").html("Doctors / Hospitals:").style("margin-right", "10px").style("margin-left", "10px");

		var surgList = AllSurgeries;
		surgList.sort(function (a, b) {
			if (a.name < b.name) {
				return -1;
			}
			if (a.name === b.name) {
				return 0;
			}
			if (a.name > b.name) {
					return 1;
			}
		});
		buttonGroups.append("select")
				.attr("id", "dropMenu")
				.on("change", function (d) {
					UnselectHospitals();
					var selectedSurgery = this.value;
					waitingTableHospitals = FindHospitalsWaitingTime(selectedSurgery);
					waitingTableDoctors = FindDoctorsWaitingTime(selectedSurgery);
					UpdateScatterMatrix(waitingTableDoctors, "Doctors", false);

					bcMap.CalculateArcsData(waitingTableHospitals);
					bcMap.DrawLinks(true);
					bcMap.DrawArcs(true);

					allDocsBarChart.Data(waitingTableDoctors).Update(true);
				})
			.selectAll("option")
			.data(surgList)
			.enter()
			.append("option")
			.attr("id", "surgeryOption")
			.text(function (d) {
				return d.name
			});

		buttonScatter.append("select")
				.attr("id", "dropMenuScatter")
				.on("change", function (d) {
					var selectedValue = this.value;
					if (selectedValue == "Doctors")
						UpdateScatterMatrix(waitingTableDoctors, selectedValue, true);
					else if (selectedValue == "Hospitals")
						UpdateScatterMatrix(waitingTableHospitals, selectedValue, true);
				})
			.selectAll("option")
			.data(scatterOption)
			.enter()
			.append("option")
			.attr("id", "scatterOption")
			.text(function (d) {
				return d;
			});

		//default surgery
		waitingTableHospitals = FindHospitalsWaitingTime(surgList[0].name);
		waitingTableDoctors = FindDoctorsWaitingTime(surgList[0].name);
	}
});

