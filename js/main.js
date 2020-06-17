var w = 800,
	h = 300,
	svg = d3
		.select("#chart")
		.append("svg")
		.attr("width", w)
		.attr("height", h);
		
var margin = { top: 40, right: 0, bottom: 50, left: 50 }
var figw = w - margin.left - margin.right;
var figh = h - margin.top - margin.bottom;

var gDrawing = svg
	.append("g")
	.attr("transform", `translate(${margin.left}, ${margin.top})`);

function remove(data) {
	svg.selectAll("rect").remove();
}

function update(data) {	
	var maxAge = d3.max(data, function(d){
		return +d.Age;
	});
	
	data = data.filter(function(d){
		filters = document.getElementsByTagName("input");
		var display = [];
		var full = []
		for(var i=0;i<filters.length;i++){
			f = filters[i];
			val = f.value;
			state = f.checked;
			
			full.push(val);
			
			if(state==true){
				display.push(val);
			}
		}

		if(display.length==0){
			display = full;
		}
		
		return display.includes(d.Category);
	});

	var y = d3.scaleLinear()
		.domain([0,10])
		.range([margin.top+figh,margin.top]);
	
	var x = d3.scaleLinear()
		.domain([0,maxAge])
		.range([margin.left, margin.left+figw+margin.right]);
	
	var recth = (x(1)-x(0)) * 0.9;
	var rectw = recth;
	var mat = Array(11);
	var colorMat = Array(11)
	for (var i=0; i <= 10; i++) {
	  mat[i] = Array(maxAge+1);
	  colorMat[i] = Array(maxAge+1)
	  for (var j=0; j<=maxAge; j++) {
		mat[i][j] = 0;
		colorMat[i][j] = [];
	  }
	}
	
	x.domain([0, maxAge]);
	y.domain([0, 10]);

    for (var i=0; i < data.length; i++) {
		age = Math.floor(data[i].Age);
		rating = 2*data[i].Rating;
		category = data[i].Category;
		if(age > 0 & rating > 0){
			mat[rating][age]++;
			if(colorMat[rating][age][category]>0){
				colorMat[rating][age][category]++;
			} else{
				colorMat[rating][age][category] = 1;
			}
		}
    }
	
	// Flatten matrices
    var flatMat = Array(10 * maxAge);
    var colorFlatMat = Array(10 * maxAge);
    for (var i=0; i<flatMat.length; i++) {
		flatMat[i] = mat[Math.floor(i/maxAge)][i % maxAge];
		colorFlatMat[i] = colorMat[Math.floor(i/maxAge)][i % maxAge];
    }
	
	var maxCt = d3.max(flatMat)
	svg.selectAll("rect").data(flatMat).enter().append("rect")
		.attr("id", function(d,i){
			age = i % maxAge;
			rating = Math.ceil(i/maxAge);
			return JSON.stringify({'age':age,'rating':rating});
		})
		.attr("x", function(d,i) { return x(i % maxAge); })
		.attr("y", function(d,i) { return y(Math.floor(i / maxAge)) })
		.attr("width",rectw)
		.attr("height",recth)
		.attr("fill", function(d,i) {
			// Calculate hue based on most common category:
			var max = 0;
			var maxKey = '';
			for (key in colorFlatMat[i]){
				val = colorFlatMat[i][key]
				if(val >= max){
					max = val;
					maxKey = key;
				}
			}
			
			switch(maxKey){
				case 'Scotch':
					h=45;
					break;
				case 'Bourbon':
					h=0;
					break;
				case 'Irish':
					h=120;
					break;
				case 'Rye':
					h=300;
					break;
				case 'Japanese':
					h=240;
					break;
				default:
					h=90;
			}
			
			s = 1;
			l = 1-d/d3.max(flatMat)
			return d3.hsl(h,s,l).toString(); 
		})
		.on("mouseover", function(d) {
			info = JSON.parse(d3.select(this).attr("id"));
			age = info.age;
			rating = info.rating;
			count = d;
			
			if(count > 0){
				list = data.filter(function(d){
					return d.Age == age & d.Rating == rating/2;
				});
				
				s = "<br />AGE: <b>" + age + "</b><br />";
				s += "RATING: <b>" + rating + "</b><br />";
				s += "<br />WHISKIES:<ul>"
				for(var i=0;i<list.length;i++){
					s += "<li>" + list[i].Brand + ' ' + list[i].Product + "</li>";
				}
				
				s += "</ul>";
			}
			
			document.getElementById("readout").innerHTML = s;
		})
		.on("mouseout", function(d) {

		});
	  
	// Axes
	gDrawing //X
		.append("g")
		.attr("transform", `translate(-50,-10)`)
		.call(d3.axisBottom(x))
		.append("text")
		.style("fill", "black")
		.style("font-size", "12pt")
		.text("Age")
		.attr("transform", `translate(65, -5)`);

	gDrawing //Y
		.append("g")
		.attr("transform", `translate(-5,-20)`)
		.call(d3.axisLeft(y))
		.append("text")
		.style("fill", "black")
		.style("font-size", "12pt")
		.text("Rating")
		.attr("transform", `translate(0,30)`);
}
	  

d3.csv("./data/whisky.csv", update);

// React to filter checkbox change
function filter(box){
	document.getElementById("readout").innerHTML = '';
	d3.csv("./data/whisky.csv", remove);
	d3.csv("./data/whisky.csv", update);
}
