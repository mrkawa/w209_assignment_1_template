var width = 800,
	height = 500,
	svg = d3
		.select("#chart")
		.append("svg")
		.attr("width", width)
		.attr("height", height);

var margin = { top: 30, right: 30, bottom: 30, left: 40 },
	iwidth = width - margin.left - margin.right,
	iheight = height - margin.top - margin.bottom;

var gDrawing = svg
	.append("g")
	.attr("transform", `translate(${margin.left}, ${margin.top})`);

var x = d3.scaleLinear()
	.range([0, iwidth]);
var y = d3.scaleLinear()
	.range([iheight, 0]);
var color = d3.scaleLinear()
	.range(["white", "red"])
	.domain([1,10])


function update(data) {
	// Data parsing, in case you need it
	data.forEach(function (d) {
		//console.log(d);
	});

	// TODO Update scale domains based on your data variables
	var maxAge = d3.max(data, function(d){
		return +d.Age;
	});
	x.domain([0, maxAge]);
	y.domain([0, 5]);

	gDrawing
		.append("g")
		.attr("transform", `translate(0,${iheight})`)
		.call(d3.axisBottom(x))
		.append("text")
		.style("fill", "black")
		.style("font-size", "12pt")
		.text("Age")
		.attr("transform", `translate(${iwidth}, ${-20})`);

	gDrawing
		.append("g")
		.call(d3.axisLeft(y))
		.append("text")
		.style("fill", "black")
		.style("font-size", "12pt")
		.text("Rating")
		.attr("transform", `translate(${50}, 0)`);

	var marks = gDrawing.selectAll(".mark").data(data);
	
	// Create size lookup table
	lookup = {};
	data.forEach(function(d){
		//console.log('Rating:', d.Rating, 'Age:', d.Age)
		if(!(d.Rating in lookup)){
			lookup[d.Rating] = {};
		}
		if(!(d.Age in lookup[d.Rating])){
			lookup[d.Rating][d.Age] = 1;
			//console.log("undefined, set to",lookup[d.Rating][d.Age]);
		}
		lookup[d.Rating][d.Age] += 1;
		//console.log("already defined, set to",lookup[d.Rating][d.Age]);
		//console.log('Rating:', d.Rating, 'Age:', d.Age, '|', lookup[d.Rating][d.Age]);
	});
	//console.log(lookup);
	
	var maxCt = 0;
	for (var key in lookup){
		sub = lookup[key];
		for (var subKey in sub){
			if (key > 0 && subKey > 0){
				if (sub[subKey] > maxCt){
					maxCt = sub[subKey];
				}
			}
		}
	}

	// Update
	marks;
	//TODO change the attribs/style of your updating mark

	// Newly created elements
	//marks.enter().append("circle").attr("class", "mark");
	marks.enter()
	.append("circle")
		.attr("class", "mark")
		.attr("cx", function(d){return x(d.Age);})
		.attr("cy", function(d){return y(d.Rating);})
		.attr("r", function(d){
			return lookup[d.Rating][d.Age];
		})
		.style("fill",function(d){
			switch(d.Category){
				case "Scotch": return "orange";
				case "Bourbon": return "red";
				case "American": return "red";
				case "American SM": return "red";
				case "Rye": return "pink";
				case "Irish": return "green";
				case "Japanese": return "yellow";
				case "Canadian": return "gray";
				case "World": return "blue";
				case "Flavored": return "purple";
			}
			return '#000';
		})
		.attr("opacity", function(d){
			ct = lookup[d.Rating][d.Age]
			scaled = ct/maxCt;
			console.log(ct,'/',maxCt,'=',scaled);
			opacity = (scaled + 1) / 2;
			console.log(opacity);
			return opacity;
		});
	// TODO change for the mark you want to use e.g. rect, path, etc
	//TODO change the attribs/style of your updating mark
	
	// Remove nulls
	svg.selectAll("circle")
		.data(data)
		.filter(function(d) {
			return d.Age == 0 | d.Rating == 0;
		})
		.remove();
	
	// Elements to remove
	marks.exit().remove();
}

d3.csv("./data/whisky.csv", update);
