configs.bar = {
    "type": "org.cishell.json.vis.metadata",
}

events.TemporalBarChart = function(ntwrk) {
	var inputdata = ntwrk.filteredData.records.data;
	legendpos = width+c2width+10

	var sortdata = ntwrk.filteredData.records.data;
    var byagency = sortdata.slice(0);
    byagency.sort(function(a,b){
    	var textA = a.agency.toUpperCase();
    	var textB = b.agency.toUpperCase();
    	if(textA < textB) {return -1};
    	if(textA > textB) {return 1};
    	return 0;
    });

	var division = d3.nest()
		        .key(function(d) {
		          return d['agency'];
		        })
		        .rollup(function(d1) {
		          return {
		            grantsum: d3.sum(d1, function(d) {
		              return d['total'];
		            }) 
		          };
		        })
		        .entries(byagency)
	
	ntwrk.SVGlegend.attr('height',100+(20*division.length))

	var leggroup = ntwrk.SVGlegend.append('g')
		.attr('class','legendgroup')
		.attr("transform","translate(10,0)")

	leggroup.append('foreignObject')
		.attr('transform',function(){
			return "translate(0,"+margin+")"
		})
		.attr('class','leggivtitle')
		.attr('style','black')
		.attr('width',200)
		.attr('height',20)
		.html(function(){
			return "<p><b>Funding Agencies:<b></p>"
        })

	var legends = leggroup.selectAll('circle')
		.data(division)
		.enter()
		.append('g')
		.attr('class','legend')
		.attr("transform", function(d, i) {
			  	return "translate(0," + (2*margin+15+(20*i)) + ")"
			})

	var items = legends.append('circle')
	items
		.attr('class',function(d){
			return 'circ_'+d.key.replaceAll(/\s+/g, '');
		})
		.attr('r',5)
		.attr('fill',function(d){
			var rec = d.key.replaceAll(/\s+/g, '')
			var tcol = ntwrk.SVGfocus.select('.rect_'+rec).attr('fill')
			return tcol;
		})

	var texts = legends.append('text')
		texts
		.text(function(d, i) {
			return (d['key']+' - $'+numberToCurrency(d['values'].grantsum));
		})
		.attr('class',function(d){
			return 'txt_'+d.key.replaceAll(/\s+/g, '');
		})
		.attr("x", 20)
		.attr('y',2.5)
		.attr("font-family", "sans-serif")
		.attr("font-size", "11px")
		.attr("visibility", "visible")



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
			  if (tspan.node().getComputedTextLength() > width || word.includes("-") == true) {
		        line.pop();
		        tspan.text(line.join(" "));
		        line = [word];
		        tspan = text.append("tspan").attr('id','tspan').attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word)
				}
		    }
		  });
		}

	// Render all footer items here ...
	
	footertxt = footeritems.append('g')
		.attr("class",'footertxt')

	footertxt.append("foreignObject")
		.attr('class','readmaptxt')
		.attr('style','black')
		.attr('width',contextwth/4)
		.attr('height',cbrushdims)
		.html(function(){
			return "<p><b>How To Read This Map</b><br />This temporal bar graph represents each record as a horizontal bar with a specific start and end Year. The width of each bar encodes the total award amount. Bars are colored to present the funding agency."
        })

	footerleg.append('foreignObject')
		.attr('class','footinicatorss')
		.attr('style','black')
		.attr('width',contextwth/5)
		.attr('height',cbrushdims)
		.html(function(){
			var min = d3.min(inputdata,function(d){
				return parseInt(d['total'])
			})
			var max = d3.max(inputdata,function(d){
				return parseInt(d['total'])
			})
			return "<p><b>Legend</b><br />Minimum Award Amount: $"+numberToCurrency(min)+"<br />Maximum Award Amount: $"+numberToCurrency(max)+"<br />Color: Funding Agency</p>"
        })

    
	

	ntwrk.SVGfocus.group.labelover = labelover();
	    function labelover() {
	        ntwrk.SVGfocus.group.selectAll(".focusrectgroup")
	            .on("mouseover",function(d,i){
	            	var dat = d;
	            	var current = d3.select(this).select('rect')
	            	var coordinates = [0, 0];
					coordinates = d3.mouse(this);
	                current
	                	.classed("selected",true)
	                	d3.select(this).selectAll('text').attr("visibility",'visible')
	                ntwrk.SVGlegend.select('.circ_'+d['agency'].replaceAll(/\s+/g, '')).classed('selected',true)
	                ntwrk.SVGlegend.select('.txt_'+d['agency'].replaceAll(/\s+/g, '')).classed('selected',true)
				})
	            .on("mouseout",function(d,i){
	            	d3.select(this).selectAll('rect').classed('selected',false)
	            	d3.select(this).selectAll('text').attr("visibility",'hidden')
	                ntwrk.SVGfocus.group.selectAll('.tlables').attr('visibility','hidden')
	                ntwrk.SVGfocus.selectAll('rect').classed('selected',false)
	                ntwrk.SVGlegend.selectAll('circle').classed('selected',false)
	                ntwrk.SVGlegend.selectAll('text').classed('selected',false)
	                ntwrk.SVGfocus.selectAll('.lrects').attr('visibility','hidden')
	            })
	            .on('mousemove',function(){
	            	var coordinates = [0, 0];
					coordinates = d3.mouse(this);
					var x = coordinates[0];
					var y = coordinates[1];
					d3.select(this).select('.tlabels')
						.attr('transform',"translate("+(x+15)+","+(y+15)+")")
					d3.select(this).select('.lrects')
						.attr('visibility','visible')
	            })

	        ntwrk.SVGlegend.selectAll('.legend')
	        	.on('mouseover',function(d,i){
	        		var rec = '.rect_'+d.key.replaceAll(/\s+/g, '')
	        		ntwrk.SVGfocus.group.selectAll('rect').filter(rec).classed('selected',true)
	        		d3.select(this)
	        		.classed("selected",true)
	        		ntwrk.SVGfocus.select('.circ_'+d.key.replaceAll(/\s+/g, '')).classed('selected',true)
	        	})
	        	.on("mouseout",function(d,i){
	        		d3.select(this).classed("selected",false)
	        		var rec = '.rect_'+d.key.replaceAll(/\s+/g, '')
	        		ntwrk.SVGfocus.group.selectAll('rect').filter(rec).classed('selected',false)
	        		ntwrk.SVGfocus.select('.circ_'+d.key.replaceAll(/\s+/g, '')).classed('selected',false)
	        	})
		}
	
	// var imggroup = ntwrk.SVGcontext.append('g')
	// 	.attr('class','imagegroup')
	// 	.attr('transform',function(){
	// 		return "translate("+0+','+(-ntwrk.config.dims.fixedHeight)+")"
	// 	})

	// imggroup.append("svg:image")
 //                .attr("xlink:href", "images/CNS_logo.png")
 //                .attr("width", "50")
 //                .attr("height", "100");
}

dataprep.TemporalBarChart = function(ntwrk) {
	ntwrk.filteredData.records.data.forEach(function(d, i) {
         Object.keys(d).forEach(function(d1, i1) {
             d[d1] = d[d1].toString();
             d[d1] = d[d1].replaceAll(/[\/]/g, "").replaceAll(/\./g,"").replaceAll(/[&]/g," AND ")
              if (d[d1].indexOf("Unknown") > -1) {
                  console.log("ding")
                  delete d
              }
         })
     })

	ntwrk.filteredData.records.data.forEach(function(d, i) {
         d['grantdays'] = d['grantstartyear'] + d['grantendyear']
     })

	var sortdata = ntwrk.filteredData.records.data;
    var bygrnatstartyear = sortdata.slice(0);
    bygrnatstartyear.sort(function(a,b){
    	return a.grantdays - b.grantdays;
    });
	ntwrk.filteredData.records.data = bygrnatstartyear
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


