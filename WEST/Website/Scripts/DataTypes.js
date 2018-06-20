var hospitalID = 0;
function Hospital(Name, X, Y, region, hospitalRate) {
	this.Name = Name;
	this.ID = "HS" + hospitalID;
	hospitalID++;
	this.X = X;
	this.Y = Y;
	this.region = region;
	this.hospitalRate = 24 - hospitalRate;
}


function Doctor(Name) {
	this.name = Name;
}

function DoctorSurgeryInfo(doc, WaitingTime, FiftyW, NintyW) {
	this.doc = doc;
	this.waitingTime = WaitingTime;
	this.fiftyWeek = FiftyW;
	this.nintyWeek = NintyW;
}

function WaitingTimeInfo(ageGroup, region, hospital, surgery, doctor, NoWaitingCase, FiftyWeek, NinetyWeek, rating) {
	this.ageGroup = ageGroup;
	this.region = region;
	this.hospital = hospital;
	this.surgery = surgery;
	this.doctor = doctor;
	this.fiftyWeek = FiftyWeek;
	this.ninetyWeek = NinetyWeek;
	this.noWaitingCase = NoWaitingCase;
	this.rating = ((doctor === null) && (hospital !== null)) ? hospital.hospitalRate : rating;
	
	if (this.doctor !== null)
		this.doctor.rating = rating;
}

WaitingTimeInfo.prototype.GetWaitingTime = function ()
{
	if (this.noWaitingCase === 2.5)
		return "< 5";
	else
		return this.noWaitingCase;
}


function Surgery(Name, bodyPart) {
	this.name = Name;
	this.bodyPart = bodyPart;
}


function Region(Name) {
	this.name = Name;
	this.Hospitals = null;
}

var surgeriesList = [new Surgery("Mastoidectomy", "Ears"), new Surgery("Myringotomy", "Ears"), new Surgery("Breast Biopsy", "Breast")];


var regions = [new Region("Fraser"), new Region("Interior"), new Region("Northern"), new Region("Vancouver Coastal"), new Region("Vancouver Island"), new Region("Provincial Health Services Authority")];
var Fraser = regions[0];
Fraser.Hospitals = [
	//Fraser
	new Hospital("Abbotsford Regional Hospital and Cancer Centre", -122.314120, -49.036363, Fraser,3.96),
	new Hospital("Burnaby Hospital", -123.015765, -49.250103, Fraser,3.76),
	new Hospital("Chilliwack General Hospital", -121.964038, -49.167409, Fraser,9.6),
	new Hospital("Delta Hospital", -123.062757, -49.086248, Fraser,-1),
	new Hospital("Eagle Ridge Hospital", -122.823547, -49.285877, Fraser,0),
	new Hospital("Langley Memorial Hospital", -122.612103, -49.095958, Fraser,10.16),
	new Hospital("Pattison Outpatient Centre", -122.833267, -49.179866, Fraser,-1),
	new Hospital("Peace Arch Hospital", -122.793721, -49.030131, Fraser,6.12),
	new Hospital("Ridge Meadows Hospital", -122.629505, -49.216041, Fraser, 23.22),
	new Hospital("Royal Columbian Hospital", -122.629505, -49.216041, Fraser, 9.89),
	new Hospital("Surrey Memorial Hospital", -122.891632, -49.226889, Fraser, 9.51)
];

var Interior = regions[1];
Interior.Hospitals = [
	//Interior
	new Hospital("Cariboo Memorial Hospital", -122.143639, -52.137808, Interior,0),
	new Hospital("East Kotenay RegionalHospital", -115.750025, -49.512866, Interior,4.79),
	new Hospital("Elk Valley Hospital", -115.056277, -49.513897, Interior,-1),
	new Hospital("Golden and District General Hospital", -116.918152, -51.460852, Interior,-1),
	new Hospital("Kelowna General Hospital", -119.491385, -49.874781, Interior,9.77),
	new Hospital("Kootenay Boundary Regional Hospital", -117.700249, -49.103896, Interior, 8.15),
	new Hospital("Kootenay Lake Hospital", -117.284914, -49.495281, Interior, -1),
	new Hospital("Penticton Regional Hospital", -119.577773, -49.481774, Interior,6.47 ),
	new Hospital("Pleasant Valley Health Centre", -119.208659, -50.439632, Interior, -1),
	new Hospital("Queen Victoria Hospital", -118.190406, -50.977872, Interior, -1),
	new Hospital("Royal Inland Hospital", -120.334607, -50.670504, Interior, 7.93),
	new Hospital("Shuswap lake general Hospital", -119.274534, -50.704762, Interior,-1),
	new Hospital("Summerland Memorial Health Centre", -119.658417, -49.681847, Interior,-1),
	new Hospital("Vernon Jubilee Hospital", -119.272366, -50.25744, Interior,6.13)
];

var Northern = regions[2];
Northern.Hospitals = [
	//Northen
	new Hospital("Bulkley Valley District Hospital", -127.163064, -54.785444, Northern, -1),
	new Hospital("Dawson Creek and District Hospital", -120.235154, -55.7504, Northern, -1),
	new Hospital("Fort St John General Hospital", -120.815719, -56.257798, Northern, -1),
	new Hospital("G.R. Baker Memorial Hospital", -122.49984, -52.982162, Northern, -1),
	new Hospital("Kitimat General Hospital", -128.646948, -54.051201, Northern, -1),
	new Hospital("Mills Memorial Hospital", -128.596308, -54.510793, Northern, -1),
	new Hospital("Prince Rupert Regional Hospital", -130.331418, -54.305307, Northern, -1),
	new Hospital("St. John Hospital", -124.009262, -54.028696, Northern, -1),
	new Hospital("The University Hospital of Northern British Columbia", -122.813858, -53.893617, Northern,7.46),
	new Hospital("Wrinch Memorial Hospital", -127.650711, -55.26046, Northern,-1)

];

var VanC = regions[3];
VanC.Hospitals = [
	//Vanc Coastal
	new Hospital("Lions Gate Hospital", -123.06821, -49.321234, VanC,8.04),
	new Hospital("Mount Saint Joseph Hospital", -123.092983, -49.264668, VanC,8.02),
	new Hospital("Powell River General Hospital", -124.508881, -49.954754, VanC,-1),
	new Hospital("Richmond Hospital", -123.146359, -49.169499, VanC,7.06),
	new Hospital("Squamish General Hospital", -123.142754, -49.697589, VanC,-1),
	new Hospital("St. Mary's Hospital", -123.748934, -49.474957, VanC,-1),
	new Hospital("St. Paul's Hospital", -123.128163, -49.280908, VanC,8.02),
	new Hospital("UBC Health Sciences Centre", -123.244732, -49.271389, VanC,6.49),
	new Hospital("Vancouver General Hospital", -123.122412, -49.262736, VanC,6.49)
];

var VanI = regions[4];
VanI.Hospitals = [
	//Vanc Island
	new Hospital("Royal Jubilee Hospital", -123.327841, -48.433664, VanI, 9.48),
	new Hospital("Campbell River and District General Hospital", -125.242132, -50.015902, VanI,11.81),
	new Hospital("Cowichan District Hospital", -123.722669, -48.78634, VanI,9.38),
	new Hospital("Greater Victoria Hospitals", -123.418076, -48.505687, VanI,9.48),
	new Hospital("Nanaimo Regional General Hospital", -123.971063, -49.185799, VanI,8.39),
	new Hospital("ST. Joseph's General Hospital", -124.941851, -49.675099, VanI,5),
	new Hospital("West Coast General Hospital", -124.782078, -49.249851, VanI,-1)
];

///Provincial Health Services Authority
var Provencial = regions[5];
Provencial.Hospitals = [
	//Provencial
	new Hospital("B.C. Cancer Agency", -123.123985, -49.28214, Provencial,-1),
	new Hospital("B.C. Children's Hospital", -120.235154, -55.7504, Provencial,-1),
	new Hospital("B.C. Women's Hospital", -120.815719, -56.257798, Provencial,-1)
];


//List of all doctors
var AllDoctors = [];
//List of all the surgeries
var AllSurgeries = [];
var AllHospitals = [];
var waitingTable = [];


for (var i = 0; i < regions.length ; i++) {
	for (var j = 0 ; j < regions[i].Hospitals.length; j++) {
		AllHospitals.push(regions[i].Hospitals[j]);
	}
}



function FindRegion(name) {
	for (var i = 0 ; i < regions.length ; i++) {
		if (regions[i].name === name) {
			return regions[i];
		}
	}
	return null;
}

function FindHospital(name) {
	name = name.toUpperCase();
	for (var i = 0 ; i < AllHospitals.length ; i++) {
		if (AllHospitals[i].Name) {
			if (AllHospitals[i].Name.toUpperCase() === name) {
				return AllHospitals[i];
			}
		}
	}
	return null;
}

function FindSurgery(name) {
	for (var i = 0 ; i < AllSurgeries.length ; i++) {
		if (AllSurgeries[i].name === name) {
			return AllSurgeries[i];
		}
	}
	return null;
}

function FindDoctor(name) {
	name = name.toUpperCase();
	for (var i = 0 ; i < AllDoctors.length ; i++) {
		if (AllDoctors[i].name === name) {
			return AllDoctors[i];
		}
	}

	return null;
}

function AddDoctor(name) {
	name = name.toUpperCase();
	var doctor = FindDoctor(name);
	if (doctor == null) {
		var d = new Doctor(name);
		AllDoctors.push(d);
		return d;
	}
	return doctor;
}

/// Find list of hospitals that do a surgery
function FindHospitalsWaitingTime(name) {
	var waitingTableHospitals = [];
	var s = FindSurgery(name);
	for (var i = 0; i < waitingTable.length ; i++)
	{
		if (waitingTable[i].surgery === s && waitingTable[i].hospital != null && waitingTable[i].doctor == null)
		{
			waitingTableHospitals.push(waitingTable[i]);
		}
	}
	return waitingTableHospitals;
	
}

/// Find list of doctors that do a surgery
function FindDoctorsWaitingTime(name) {
	var waitingTableDoctors = [];
	var s = FindSurgery(name);
	for(var i = 0; i < waitingTable.length; i++)
	{
		if(waitingTable[i].surgery === s && waitingTable[i].hospital != null && waitingTable[i].doctor != null)
		{
			waitingTableDoctors.push(waitingTable[i]);
		}
	}
	return waitingTableDoctors;
}

