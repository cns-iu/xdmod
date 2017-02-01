visualizationFunctions.TemporalBarChart = function(element, data, opts) {
	var network = visualizations[opts.ngIdentifier];
	network.parentVis = visualizations[opts.ngComponentFor];
	
	network.VisFunc = function() {
		network.config = network.CreateBaseConfig();
		network.SVGfocus = network.config.easySVG(element[0], {
			responsive: false
			})
			.attr('background', 'white')
			.attr('class', 'focus ' + opts.ngIdentifier)
		network.SVGcontext = network.config.easySVG(element[0], {
			responsive: false
			})
			.attr('background', 'white')
			.attr('class', 'context ' + opts.ngIdentifier)

		// Initialize input data ...
		inputdata = network.filteredData.records.data;
		var granttotal = d3.sum(inputdata, function(d){
			return d['total'];
		})
		
		initCanvas(inputdata)
		
		// Render Clip paths for All the SVG's ...
		network.SVGfocus.append("svg:clipPath")
			.attr("id","clipfocus")
			.append("svg:rect")
			.attr("x", 0)
			.attr("y", -(fheight))
			.attr("width", fwidth+margin)
			.attr("height", fheight+margin)

		// network.SVGcontext.append("svg:clipPath")
		// 	.attr("id","clipcontext")
		// 	.append("svg:rect")
		// 	.attr("x", 0)
		// 	.attr("y", -(cheight-margin))
		// 	.attr("width", fwidth)
		// 	.attr("height", cheight-margin-20)

		// Define all the X Scale here ...
		// X Scale for the focus and context rects
		xscale = d3.time.scale()
			.domain([d3.min(inputdata,function(d){
				return d['grantstartyear'];
			}),
			d3.max(inputdata,function(d){
				return d['grantendyear'];
			})])
			.range([margin,fwidth-margin])
			.nice()
		
		var fxaxis = d3.svg.axis()
			.scale(xscale)
			.tickSize(-(fheight-margin), 0, 0)
			.tickFormat(d3.format('Y'))

		var cxaxis = d3.svg.axis()
			.scale(xscale)
			.tickSize(-(cbrushdims-margin), 0, 0)
			.tickFormat(d3.format('Y'))

		// X scale for the viewbox summary values
		network.SVGfocus.summaryscale = d3.scale.linear()
			.domain([d3.min(inputdata,function(d){
				return d['grantstartyear'];
			}),
			d3.max(inputdata,function(d){
				return d['grantendyear'];
			})])
			.range([margin,fwidth-margin])
			.nice()

		// X scale for the context brush rects
		x2scale = d3.time.scale()
			.domain([d3.min(inputdata,function(d){
				return d['grantstartyear'];
			}),
			d3.max(inputdata,function(d){
				return d['grantendyear'];
			})])
			.range([margin,fwidth-margin])
			.nice()

		// X Scale for the Focus Brush rects
		x3scale = d3.time.scale()
			.domain([d3.min(inputdata,function(d){
				return d['grantstartyear'];
			}),
			d3.max(inputdata,function(d){
				return d['grantendyear'];
			})])
			.range([0,c2width-margin])
			.nice()

		// Define all the Y Scale here ...
		// Y Scale for the focus rects ...
		yfocusscale = d3.scale.linear()
			.domain([0,granttotal])
			.range([0,(fheight - (margin+(inputdata.length*rectpad)))])

		// Y Scale for context brush rects ...
		ycontextscale = d3.scale.linear()
			.domain([0,granttotal])
			.range([0,cbrushdims-margin])

		// Y Scale for Focus brush rects ...
		y2focusscale = d3.scale.linear()
			.domain([0,granttotal])
			.range([0,((fheight) - (margin+(inputdata.length*rectpad)))])

		// Y scale for inverted y values for the Focus brush ...
		y3focusscale = d3.scale.linear()
			.domain([0,granttotal])
			.range([0,-(fheight-margin)])

		// Group to append all items in the focus SVG ...
		network.SVGfocus.group = network.SVGfocus.append('g')
			.attr('class','focusgroup')
			.attr('clip-path',"url(#clipfocus)")

		// Group to append all items in the Context SVG ...
		network.SVGcontext.group = network.SVGcontext.append('g')
			.attr('class','contextgroup')
			.attr("transform",function(){
				return "translate(0,"+-cbrushdims+")"
			})

		// Clip path for the rects in Focus group ...
		network.SVGfocus.group.append("svg:clipPath")
			.attr("id","cliprects")
			.append("svg:rect")
			.attr("x",margin)
			.attr("y", -(fheight+margin))
			.attr("width", fwidth-2*margin)
			.attr("height", fheight+margin)

		var focusaxis = network.SVGfocus.group.append('g')
			.attr('class','focusaxis')
			.attr('clip-path',"url(#clipfocus)")
			.call(fxaxis)
			.style("stroke-dasharray", ("3, 3"))

		var contextaxis = network.SVGcontext.group.append('g')
			.attr("transform",function(){
				return "translate(0,"+margin+")"
			})
			.call(cxaxis)
			.style("stroke-dasharray", ("3, 3"))

		d3.selectAll(".domain").style("stroke-dasharray", ("3, 0"));

		focusallitemsgroup = network.SVGfocus.group.append('g')
			.attr('class','focusallitemsgroup')
			.attr('transform',"translate(0,0)")
			.attr('clip-path',"url(#cliprects)")

		// Render all Focus group items here ...
		focuscurrY = 0
		var focusitems = focusallitemsgroup.selectAll('rect')
			.data(inputdata)
			.enter()
			.append('g')
			.attr('class','focusrectgroup')
			.attr('transform',function(d,i){
				focuscurrY -= yfocusscale(d['total']) + rectpad
				return "translate("+xscale(d['grantstartyear'])+","+focuscurrY+")"
			})


		focusrects = focusitems.append('rect')
		focusrects
			.attr('class',function(d,i){
				return ('rect_'+(d['agency'].replaceAll(/\s+/g, '')))+' '+"fbars";
			})
			.attr('x',0)
			.attr('y',0)
			.attr("width", function(d, i) {
				// console.log("before",xscale(d['grantendyear']) - xscale(d['grantstartyear']))
				return xscale(d['grantendyear']) - xscale(d['grantstartyear']);
			})
			.attr('height',function(d,i){
				return yfocusscale(d['total']);
			})
			.attr('fill', function(d, i) {
				return network.Scales.colors(d['agency']);
			})
			.attr("opacity", 0.7)
			.attr("stroke", "black")
			.attr("stroke-width", 0.25)
			.attr("rx", 3)
    		.attr("ry", 3)
		
		var litems = focusitems.append('g')
			.attr('class','tlabels')

		litems.append('rect')
			.attr('class','lrects')
			.attr('x',-10)
			.attr('y',-10)
			.attr('width',450)
			.attr('height',150)
			.attr('fill','grey')
			.attr('opacity',0.3)
			.attr('visibility','hidden')

		var labels = litems.append('text')
		labels
			.attr('class','labletext')
			.attr('style','black')
			.text(function(d){
				var name = d['user'].toString();

				return "PI: "+name.substr(0,1).toUpperCase()+name.substr(1)+" -- Position: "+d['usertitle']+" -- Funding Agency: "+d['agency']+
						" -- Title: "+d['title'].toString().substring(0,25) + '...' +
	                	" -- Start year: "+d['grantstartyear']+" -- End year: "+d['grantendyear']+
	                	" -- Award amount $"+numberToCurrency(parseInt(d['total']))
	        })
			.call(wrap,1000)
			.attr('visibility','hidden')

		// Render all Context group items here ...
		contextallitemsgroup = network.SVGcontext.group.append('g')
			.attr('class','contextallitemsgroup')
			.attr('transform',function(){
				return "translate(0,"+margin+")"
			})

		contextcurrY = 0
		var contextitems = contextallitemsgroup.selectAll('rect')
			.data(inputdata)
			.enter()
			.append('g')
			.attr('class','contextrectgroup')
			.attr('transform',function(d,i){
				contextcurrY -= ycontextscale(d['total'])
				return "translate("+xscale(d['grantstartyear'])+","+contextcurrY+")"
			})

		contextrects = contextitems.append('rect')
		contextrects
			.attr('class',function(d,i){
				return ('rect_'+(d['agency'].replaceAll(/\s+/g, '')))+' '+"cbars";
			})
			.attr('x',0)
			.attr('y',0)
			.attr("width", function(d, i) {
				return xscale(d['grantendyear']) - xscale(d['grantstartyear']);
			})
			.attr('height',function(d,i){
				return ycontextscale(d['total']);
			})
			.attr('fill', function(d, i) {
				return network.Scales.colors(d['agency']);
			})
			.attr("opacity", 0.7)
			.attr("stroke", "black")
			.attr("stroke-width", 0.01)
			.attr("rx", 3)
    		.attr("ry", 3)

    	footeritems = network.SVGcontext.append('g')
		.attr('class','footeritems')
		.attr('transform',function(){
			return "translate("+margin+","+-(cbrushdims-2*padding)+")"
		})

		footerleg = footeritems.append('g')
		.attr('class','footerleg')
		.attr('transform',function(){
			return "translate("+((contextwth/4)+padding)+",0)"
		})

		footerrectgroup = footerleg.append('g')
	    	.attr('class','footerrectgroup')
	    	.attr('transform',function(){
				return "translate("+(contextwth/5)+",0)"
			})
	    footerrectgroup.append('foreignObject')
	    	.attr('class','legtxt')
			.attr('style','black')
			.attr('width',contextwth/8)
			.attr('height',15)
			.html(function(){
				return "<p><b>Award Amount<b></p>"
	        })
	    rectgroup = footerrectgroup.append('g')
	    	.attr('class','rectgroup') 

	    rect1 = rectgroup.append('g')
	    	.attr('class','r1')
	    	.attr("transform","translate(0,25)")
	    rect1.append('rect')
	    	.attr('width',100)
	    	.attr('height',40)
	    	.attr("rx", 3)
			.attr("ry", 3)
	    	.attr('fill','black')
		txt1 = rect1.append('g').attr('transform',function(){
	    	return "translate("+(100+padding)+",25)"
	    })
	   	
	   	val1=txt1.append('text')
	    	.text(function(){
	    		return "$"+numberToCurrency(parseInt(yfocusscale.invert(40)));
	    	})

		rect2 = footerrectgroup.append('g').attr('class','r2')
	    	.attr('transform',function(){
	    		return "translate(0,"+(40+10+25)+")"
	    	})
		rect2.append('rect')
	    	.attr('width',100)
	    	.attr('height',20)
	    	.attr("rx", 3)
			.attr("ry", 3)
	    	.attr('fill','black')
	    txt2 = rect2.append('g').attr('transform',function(){
	    	return "translate("+(100+padding)+",15)"
	    })
	   	
	    val2=txt2.append('text')
	    	.text(function(){
	    		return "$"+numberToCurrency(parseInt(yfocusscale.invert(20)))
	    	})

	    rect3 = footerrectgroup.append('g').attr('class','r3')
	    	.attr('transform',function(){
	    		return "translate(0,"+(40+20+20+25)+")"
	    	})
	    rect3.append('rect')
	    	.attr('width',100)
	    	.attr('height',10)
	    	.attr("rx", 3)
			.attr("ry", 3)
	    	.attr('fill','black')
	    txt3 = rect3.append('g').attr('transform',function(){
	    	return "translate("+(100+padding)+",10)"
	    })
	   	
	    val3 = txt3.append('text')
	    	.text(function(){
	    		return "$"+numberToCurrency(parseInt(yfocusscale.invert(10)))
	    	})


    	// Render all focus brush items here ...
    	network.SVGfocus.brush = network.SVGfocus.append('g')
			.attr('class','brushgroup')
			.attr('transform',function(){
				return "translate("+(fwidth+margin)+",0)"
			})

		network.SVGfocus.brush.append("svg:clipPath")
			.attr("id","clipfocusbrush")
			.append("svg:rect")
			.attr("x", 0)
			.attr("y", -(fheight))
			.attr("width", c2width-20)
			.attr("height", fheight)


		var fbrush = network.SVGfocus.brush.append('g')
			.attr('class','focusbrushallitemsgroup')
			.attr('transform',"translate(0,0)")
			.attr('clip-path',"url(#clipfocusbrush)")

		fbrushcurrY = 0
		var fbrushitems = fbrush.selectAll('rect')
			.data(inputdata)
			.enter()
			.append('g')
			.attr('class','fbrushrectgroup')
			.attr('transform',function(d,i){
				fbrushcurrY -= y2focusscale(d['total'])  + rectpad
				return "translate("+x3scale(d['grantstartyear'])+","+fbrushcurrY+")"
			})

		fbrushrects = fbrushitems.append('rect')
		fbrushrects
			.attr('class',function(d,i){
				return ('rect_'+(d['agency'].replaceAll(/\s+/g, '')))+' '+"fbrushbars";
			})
			.attr('x',0)
			.attr('y',0)
			.attr("width", function(d, i) {
				return x3scale(d['grantendyear']) - x3scale(d['grantstartyear']);
			})
			.attr('height',function(d,i){
				return y2focusscale(d['total']);
			})
			.attr('fill', function(d, i) {
				return network.Scales.colors(d['agency']);
			})
			.attr("opacity", 0.7)
			.attr("stroke", "black")
			.attr("stroke-width", 0.01)
		
		// View Summary group ...
		var viewgroup = network.SVGcontext.append('g')
			.attr('class','legendgroup')
			.attr("transform",function(){
				return "translate("+(fwidth+margin)+","+-(cheight-margin)+")"
			})

		var viewbox = viewgroup.append('g')
			.attr('class','viewbox')
			.attr('transform',"translate(0,10)")

		var t1 = network.SVGfocus.summaryscale.domain()[0]
		var t2 = network.SVGfocus.summaryscale.domain()[1]

		viewbox.append("foreignObject")
			.attr('class','viewsummary')
			.attr('width',(network.config.dims.fixedWidth)-(fwidth+(3*margin)))
			.attr('height',cheight-2*margin)
			.html(function(){
				var vr = grantsviewbox(t1,t2)
				return "<p><b>View Summary: </b><br /><br />"+" - # of Awards: <b>"+vr[0]+"</b><br /><br /> - Funding: <b>$"+numberToCurrency(parseInt(vr[1]))+"</b><br /><br /> - # of PI's: <b>"+"........."+
				"</b><br /><br /> - # of Agencies <b>"+vr[2]+"</b></p>"
	        })

    	// Brush code begins here ...
    	// Call the context Brush
		brush = initBrush();
		// Call the Focus Brush
		brush2 = initBrush2();

		// Context Brush ...
		function initBrush() {
			brush = d3.svg.brush()
				.x(x2scale)
				.extent(x2scale.domain())
				.on("brush", update);
			
			gBrush = network.SVGcontext.append("g")
				.attr("class", "brush")
				.attr("transform",function(){
					return "translate(0,"+-(cbrushdims-margin)+")"
				})
				.call(brush);
			
			gBrush.selectAll(".extent")
				.attr('y',-(cbrushdims-margin))
				.attr("height", cbrushdims-margin)
				.attr('fill','lightgrey')
				.attr('opacity','0.3');

			gBrush.selectAll(".resize")
				.append('svg:image')
				.attr("xlink:href", "images/scrubber_handle_v.png")
				.attr("id", function(d, i) {
					return "resize" + i;
				})
				.attr("x", -12)
				.attr("y", -(cbrushdims-margin))
				.attr("width", 25)
				.attr("height", cbrushdims-margin)
				
			gBrush.select(".background")
				.on("mousedown.brush", null)
				.on("touchstart.brush", null);

			
			gBrush.call(brush.event);
			return brush;
		}

		// Context Brush update method ...
		function update() {
			xscale.domain(brush.empty() ? x2scale.domain() : brush.extent());
			network.SVGfocus.summaryscale.domain(brush.empty() ? x2scale.domain() : brush.extent());
			var t1 = network.SVGfocus.summaryscale.domain()[0];
			var t2 = network.SVGfocus.summaryscale.domain()[1];
			d3.selectAll(".fbars")
				.attr("width", function(d) {
					return xscale(d['grantendyear']) - xscale(d['grantstartyear']);
				})
			network.SVGfocus.group.selectAll('.focusrectgroup')
			.attr('transform',function(d,i){
				var t = d3.transform(d3.select(this).attr('transform')).translate[1]
				return "translate("+xscale(d['grantstartyear'])+","+t+")"
			})
			network.SVGfocus.group.selectAll(".focusaxis").call(fxaxis);
			network.SVGcontext.select(".viewsummary")
				.html(function(){
					var vr = grantsviewbox(t1,t2)
					return "<p><b>View Summary: </b><br /><br />"+" - # of Awards: <b>"+vr[0]+"</b><br /><br /> - Funding: <b>$"+numberToCurrency(parseInt(vr[1]))+"</b><br /><br /> - # of PI's: <b>"+"........."+
					"</b><br /><br /> - # of Agencies <b>"+vr[2]+"</b></p>"
		        })
		}

		// Focus Brush ...
		function initBrush2() {
			brush2 = d3.svg.brush()
				.y(y3focusscale)
				.extent(y3focusscale.domain())
				.on("brush", update2);
			
			g2Brush = network.SVGfocus.brush.append("g")
				.attr("class", "brush2")
				.call(brush2);

			g2Brush.select('.background')
				.attr('y',-(fheight-margin))
				.attr('height',(fheight-margin))
				.attr('width',c2width)

			g2Brush.selectAll(".extent")
				.attr("width", c2width)
				.attr('height',fheight-margin)
				.attr('y',-(fheight-margin))
				.attr('fill','lightgrey')
				.attr('opacity','0.3')

			g2Brush.selectAll(".n")
				.attr('transform',function(){
					return "translate(0,"+-(fheight-margin)+")"
				})
			g2Brush.selectAll(".s")
				.attr('transform',function(){
					return "translate(0,0)"
				})

			g2Brush.selectAll(".s")
				.append('svg:image')
				.attr("xlink:href", "images/scrubber_handle.png")
				.attr("class", function(d, i) {
					return "resizev" + i;
				})
				.attr("x", 0)
				.attr("y",-(margin+3))
				.attr("width", c2width)
				.attr("height", c2width*(13/60))

			g2Brush.selectAll(".n")
				.append('svg:image')
				.attr("xlink:href", "images/scrubber_handle.png")
				.attr("class", function(d, i) {
					return "resizev" + i;
				})
				.attr("x", 0)
				.attr("y",0)
				.attr("width", c2width)
				.style("height", c2width*(13/60))

			g2Brush.select(".background")
				.on("mousedown.brush", null)
				.on("touchstart.brush", null);

			
			g2Brush.call(brush2.event);
			return brush2;
		}

		// Update method for focus brush
		function update2() {
			yfocusscale.domain(brush2.empty() ? yfocusscale.domain() : brush2.extent());
			d3.selectAll(".fbars")
				.attr("height", function(d) {
					return yfocusscale(sum(d['total'],yfocusscale.domain()[0].valueOf()))
				})
			fkerr = -yfocusscale(-yfocusscale.domain()[0].valueOf())/2
			network.SVGfocus.group.selectAll('.focusrectgroup')
			.attr('transform',function(d,i){
				fkerr = fkerr - yfocusscale(sum(d['total'],yfocusscale.domain()[0].valueOf()))
				return "translate("+xscale(d['grantstartyear'])+","+fkerr+")"
			})
			console.log(yfocusscale.domain())
			console.log(brush2.extent())
			val1.text(function(){
		    		return "$"+numberToCurrency(parseInt(diff(yfocusscale.invert(40),yfocusscale.domain()[0].valueOf())));
		    	})
			val2.text(function(){
		    		return "$"+numberToCurrency(parseInt(diff(yfocusscale.invert(20),yfocusscale.domain()[0].valueOf())));
		    	})
			val3.text(function(){
		    		return "$"+numberToCurrency(parseInt(diff(yfocusscale.invert(10),yfocusscale.domain()[0].valueOf())));
		    	})
		}

		// Canvas set up for all SVG items
		function initCanvas(){
			contextwth = network.config.dims.fixedWidth
			width = ((network.config.dims.fixedWidth*82.5)/100)
			fwidth = width*88/100
			fheight = (((network.config.dims.fixedHeight)*70)/100)
			cheight = ((network.config.dims.fixedHeight)*25/100)
			cbrushdims = cheight/2
			c2width = width*9/100
			margin = ((network.config.dims.fixedWidth)*1/100)
			console.log("dimensions",network.config.dims.fixedWidth,network.config.dims.fixedHeight,margin)
			var fcanvas = network.SVGfocus.node().parentNode
			fcanvas.setAttribute('height',fheight)
			fcanvas.setAttribute('width',width)
			var ccanvas = network.SVGcontext.node().parentNode
			ccanvas.setAttribute('height',cbrushdims+150)
			ccanvas.setAttribute('width',network.config.dims.fixedWidth)

			network.SVGfocus.attr('transform',"translate("+margin+','+(fheight-margin)+")")
			network.SVGcontext.attr('transform',"translate("+margin+','+(cheight-margin)+")")

			// View summary box setup...
			d3.select('.canvas').attr('class','focusSVG')
			$('.legdiv').empty();
			network.SVGlegend = d3.select(".legdiv")
				.append('svg')
				.attr('class','legendSVG')
				.attr('width',450)

			// Set legend div dimensions
			var d = document.getElementById('legdiv')
			d.style.position = "absolute";
			d.style.left = (width+margin)+'px';
			d.style.top = (network.config.dims.fixedHeight*2.5/100)+'px';
			d.style.height = fheight-margin + "px";
			d.style.width = (network.config.dims.fixedWidth - width - margin) + "px"
			
			// Set the standard variable values here ...
			rectpad = 0
			padding= 22
			network.Scales.colors = d3.scale.category10();
		}

		// All miscellaneous functions used above are defined here ...
		function sum(a,b){
			result = parseFloat(a)+parseFloat(b);
			return result;
			}
		function diff(a,b){
			result = parseFloat(a)-parseFloat(b);
			return result;
			}

		function wrap(text, width) {
		text.each(function() {
		    var text = d3.select(this);
			var words = text.text().split(/\s+/).reverse(),
		        word,
		        line = [],
		        lineNumber = 0,
		        lineHeight = 1.1,
		        y = 8
		        dy = 0
		        tspan = text.text(null).attr('id','tspan').append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
		    while (word = words.pop()) {
		      line.push(word);
		      tspan.text(line.join(" "));
			  if (tspan.node().getComputedTextLength() > width || word.includes("--") == true) {
		        line.pop();
		        tspan.text(line.join(" "));
		        line = [word];
		        tspan = text.append("tspan").attr('id','tspan').attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word)
				}
		    }
		  });
		}

		function numberToCurrency(number, decimalSeparator, thousandsSeparator, nDecimalDigits){
		    //default values
		    decimalSeparator = decimalSeparator || '.';
		    thousandsSeparator = thousandsSeparator || ',';
		    nDecimalDigits = nDecimalDigits == null? 0 : nDecimalDigits;

		    var fixed = number.toFixed(nDecimalDigits), //limit/add decimal digits
		        parts = new RegExp('^(-?\\d{1,3})((?:\\d{3})+)(\\.(\\d{'+ nDecimalDigits +'}))?$').exec( fixed ); //separate begin [$1], middle [$2] and decimal digits [$4]

		    if(parts){ //number >= 1000 || number <= -1000
		        return parts[1] + parts[2].replace(/\d{3}/g, thousandsSeparator + '$&') + (parts[4] ? decimalSeparator + parts[4] : '');
		    }else{
		        return fixed.replace('.', decimalSeparator);
		    }
		}

		function grantsviewbox(t1,t2){
		    var selectedfromitem = t1
		    var selectedtoitem = t2
		    grantfrom = 0
		    awards = 0
		    var agencies = []
		    for(i=0;i<inputdata.length;i++){
		    	yearcount = 0
		    	if((parseInt(inputdata[i]['grantendyear']) > selectedfromitem) && (parseInt(inputdata[i]['grantstartyear']) < selectedtoitem)) {
		    		// console.log("item entered")
		    		awards = awards + 1
		    		agencies.push(inputdata[i]['agency'])
		    		if((parseInt(inputdata[i]['grantstartyear']) > selectedfromitem)) {
		    			if((parseInt(inputdata[i]['grantendyear']) <= selectedtoitem)){
			    			yearcount = yearcount + (inputdata[i]['grantendyear'] - inputdata[i]['grantstartyear'])
				    	}
				    	else if((parseInt(inputdata[i]['grantendyear']) > selectedtoitem)){
			    			yearcount = yearcount + (selectedtoitem - inputdata[i]['grantstartyear'])
				    	}
				    	
				    }
			    	else if((parseInt(inputdata[i]['grantstartyear']) <= selectedfromitem)) {
			    		if((parseInt(inputdata[i]['grantendyear']) <= selectedtoitem)){
			    			yearcount = yearcount + (inputdata[i]['grantendyear'] - selectedfromitem)
			    		}
			    		else if((parseInt(inputdata[i]['grantendyear']) > selectedtoitem)){
			    			yearcount = yearcount + (selectedtoitem - selectedfromitem)
			    		}
			    	}
			    	// console.log('yearcount is:',yearcount)
			    	grantyear = (parseInt(inputdata[i]['grantendyear']) - parseInt(inputdata[i]['grantstartyear']))
			    	// console.log('grantyear is:',grantyear)
			    	grantfrom = grantfrom + ((parseInt(inputdata[i]['total']) / grantyear) * yearcount)
				
				}
		    }
		    var uniagencies = findunique(agencies)
			var viewresult = [awards,grantfrom,uniagencies.length]
			return viewresult;
		}

		function findunique(inputarray){
			var a = [];
			for(var i = 0; i < inputarray.length; i++){
				if(a.indexOf(inputarray[i]) === -1){
					a.push(inputarray[i]);
				}
			}
			return a;
		}
	}
	return network;
  }
