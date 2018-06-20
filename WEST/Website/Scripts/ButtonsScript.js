var waitingTableHospitals = [];
function createButtons() {

	var buttonsData = [
		{ name: "surgery", target: "size" }
	];

	var buttonGroups = d3.select("#buttons").selectAll(".buttonGroup")
		.data(buttonsData)
		.enter()
		.append("g").attr("class", "buttonGroup");

	buttonGroups.append("label").html("Surgery");

	buttonGroups.append("select")
		.on("change", function (d) {
			var selectedValue = this.value;
			waitingTableHospitals = FindHospitalsWaitingTime(selectedValue);
			updateVisu(true);
		})
		.selectAll("option")
		.data(AllSurgeries)
		.enter()
		.append("option")
		.text(function (d) {
			return d.name
		});

	//Scatter plot data	
	/// Changed
	waitingTableHospitals = FindHospitalsWaitingTime("Breast Biopsy");

}
