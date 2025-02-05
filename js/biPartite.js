!function(){
	var bP={};
	var b=20, bb=100, height=350, buffMargin=1, minHeight=14;
	var c1=[-150, 30], c2=[-50, 140], c3=[-10, 180]; //Column positions of labels.
	var number_of_exponential = 2;
	var colors = [];
	var neverdo = true;
	var ourId = "";


	bP.setColor = function(arr){
		arr.forEach(function(d){
			colors.push(d);
		})
	};

	function getApproximate(val) {
		return (val / 1000000000).toFixed(1);
	}

	function visualize(data){
		var vis ={};
		function calculatePosition(a, s, e, b, m){
			var total=d3.sum(a);
			var sum=0, neededHeight=0, leftoverHeight= e-s-2*b*a.length;
			var ret =[];

			a.forEach(
				function(d){
					var v={};
					v.percent = (total == 0 ? 0 : d/total);
					v.value=d;
					v.height=Math.max(v.percent*(e-s-2*b*a.length), m);
					(v.height==m ? leftoverHeight-=m : neededHeight+=v.height );
					ret.push(v);
				}
			);

			var scaleFact=leftoverHeight/Math.max(neededHeight,1), sum=0;

			ret.forEach(
				function(d){
					d.percent = scaleFact*d.percent;
					d.height=(d.height==m? m : d.height*scaleFact);
					d.middle=sum+b+d.height/2;
					d.y=s + d.middle - d.percent*(e-s-2*b*a.length)/2;
					d.h= d.percent*(e-s-2*b*a.length);
					d.percent = (total == 0 ? 0 : d.value/total);
					sum+=2*b+d.height;
				}
			);
			return ret;
		}

		vis.mainBars = [
			calculatePosition( data.data[0].map(function(d){ return d3.sum(d);}), 0, height, buffMargin, minHeight),
			calculatePosition( data.data[1].map(function(d){ return d3.sum(d);}), 0, height, buffMargin, minHeight)
		];

		vis.subBars = [[],[]];
		vis.mainBars.forEach(function(pos,p){
			pos.forEach(function(bar, i){
				calculatePosition(data.data[p][i], bar.y, bar.y+bar.h, 0, 0).forEach(function(sBar,j){
					sBar.key1=(p==0 ? i : j);
					sBar.key2=(p==0 ? j : i);
					vis.subBars[p].push(sBar);
				});
			});
		});
		vis.subBars.forEach(function(sBar){
			sBar.sort(function(a,b){
				return (a.key1 < b.key1 ? -1 : a.key1 > b.key1 ?
					1 : a.key2 < b.key2 ? -1 : a.key2 > b.key2 ? 1: 0 )});
		});

		vis.edges = vis.subBars[0].map(function(p,i){
			return {
				key1: p.key1,
				key2: p.key2,
				y1:p.y,
				y2:vis.subBars[1][i].y,
				h1:p.h,
				h2:vis.subBars[1][i].h
			};
		});
		vis.keys=data.keys;
		return vis;
	}

	function arcTween(a) {
		var i = d3.interpolate(this._current, a);
		this._current = i(0);
		return function(t) {
			return edgePolygon(i(t));
		};
	}

	function drawPart(data, id, p){
		d3.select("#"+id).append("g").attr("class","part"+p)
			.attr("transform","translate("+( p*(bb+b))+",0)");
		d3.select("#"+id).select(".part"+p).append("g").attr("class","subbars");
		d3.select("#"+id).select(".part"+p).append("g").attr("class","mainbars");

		var mainbar = d3.select("#"+id).select(".part"+p).select(".mainbars")
			.selectAll(".mainbar").data(data.mainBars[p])
			.enter().append("g").attr("class","mainbar");

		mainbar.append("rect").attr("class","mainrect")
			.attr("x", 0).attr("y",function(d){ return d.middle-d.height/2; })
			.attr("width",b).attr("height",function(d){ return d.height; })
			.style("shape-rendering","auto")
			.style("fill-opacity",0).style("stroke-width","0.5")
			.style("stroke","black").style("stroke-opacity",0);

		mainbar.append("text").attr("class","barlabel")
			.attr("x", c1[p]).attr("y",function(d){ return d.middle+5;})
			.text(function(d,i){ return data.keys[p][i];})
			.attr("text-anchor","start" );

		mainbar.append("text").attr("class","barvalue")
			.attr("x", c2[p]).attr("y",function(d){ return d.middle+5;})
			.text(function(d,i){ return getApproximate(d.value) ;})
			.attr("text-anchor","end");

		mainbar.append("text").attr("class","barpercent")
			.attr("x", c3[p]).attr("y",function(d){ return d.middle+5;})
			.text(function(d,i){ return "( "+Math.round(100*d.percent)+"%)" ;})
			.attr("text-anchor","end").style("fill","grey");

		d3.select("#"+id).select(".part"+p).select(".subbars")
			.selectAll(".subbar").data(data.subBars[p]).enter()
			.append("rect").attr("class","subbar")
			.attr("x", 0).attr("y",function(d){ return d.y})
			.attr("width",b).attr("height",function(d){ return d.h})
			.style("fill",function(d){ return colors[d.key1];});
	}

	function drawEdges(data, id){
		d3.select("#"+id).append("g").attr("class","edges").attr("transform","translate("+ b+",0)");

		d3.select("#"+id).select(".edges").selectAll(".edge")
			.data(data.edges).enter().append("polygon").attr("class","edge").attr("points", edgePolygon).style("fill",function(d){ return colors[d.key1];})
			.style("opacity",0.5).each(function(d) { this._current = d; });
	}

	function drawHeader(header, id){
		d3.select("#"+id).append("g").attr("class","header").append("text").text(header[2])
			.style("font-size","20").attr("x",108).attr("y",-20).style("text-anchor","middle")
			.style("font-weight","bold");

		[0,1].forEach(function(d){
			var h = d3.select("#"+id).select(".part"+d).append("g").attr("class","header");

			h.append("text").text(header[d]).attr("x", (c1[d]-5))
				.attr("y", -5).style("fill","grey");

			h.append("text").text("Total ($Billion)").attr("x", (c2[d]-35))
				.attr("y", -5).style("fill","grey");

			h.append("line").attr("x1",c1[d]-10).attr("y1", -2)
				.attr("x2",c3[d]+10).attr("y2", -2).style("stroke","black")
				.style("stroke-width","1").style("shape-rendering","crispEdges");
		});
	}

	function edgePolygon(d){
		//return [0, d.y2, bb, d.y1, bb, d.y1+d.h1, 0, d.y2+d.h2].join(" ");
		 return [0, d.y1, bb, d.y2, bb, d.y2+d.h2, 0, d.y1+d.h1].join(" ");
	}

	function transitionPart(data, id, p){
		var mainbar = d3.select("#"+id).select(".part"+p).select(".mainbars")
			.selectAll(".mainbar").data(data.mainBars[p]);

		mainbar.select(".mainrect").transition().duration(500)
			.attr("y",function(d){ return d.middle-d.height/2;})
			.attr("height",function(d){ return d.height;});

		mainbar.select(".barlabel").transition().duration(500)
			.attr("y",function(d){ return d.middle+5;});

		mainbar.select(".barvalue").transition().duration(500)
			.attr("y",function(d){ return d.middle+5;}).text(function(d,i){ return getApproximate(d.value) ;});

		mainbar.select(".barpercent").transition().duration(500)
			.attr("y",function(d){ return d.middle+5;})
			.text(function(d,i){ return "( "+Math.round(100*d.percent)+"%)" ;});

		d3.select("#"+id).select(".part"+p).select(".subbars")
			.selectAll(".subbar").data(data.subBars[p])
			.transition().duration(500)
			.attr("y",function(d){ return d.y}).attr("height",function(d){ return d.h});
	}

	function transitionEdges(data, id){
		d3.select("#"+id).append("g").attr("class","edges")
			.attr("transform","translate("+ b+",0)");

		d3.select("#"+id).select(".edges").selectAll(".edge").data(data.edges)
			.transition().duration(500)
			.attrTween("points", arcTween)
			.style("opacity",function(d){ return (d.h1 ==0 || d.h2 == 0 ? 0 : 0.5);});
	}

	function transition(data, id){
		transitionPart(data, id, 0);
		transitionPart(data, id, 1);
		transitionEdges(data, id);
	}

	function updateVis(data){
		// Update Edges
		transition(data, ourId);

		// UPdate Rectangle
	}

	bP.draw = function(data, svg, obj){
		if (neverdo == false){
			var visData = visualize(data[0].data);
			updateVis(visData);
			return;
		}
		else{
			ourId = data[0].id;
			neverdo = false;
		}


		data.forEach(function(biP,s){
			svg.append("g")
				.attr("id", biP.id)
				.attr("transform","translate("+ (550*s)+",0)");

			var visData = visualize(biP.data);
			drawPart(visData, biP.id, 0);
			drawPart(visData, biP.id, 1);

			drawEdges(visData, biP.id);
			drawHeader(biP.header, biP.id);

			[0, 1].forEach(function(p){
				d3.select("#"+biP.id)
					.select(".part"+ p)
					.select(".mainbars")
					.selectAll(".mainbar")
					.on("mouseover",function(d, i){
						if (obj.isClickSelected == true)	return;
						return bP.selectSegment(data, p, i);
					})
					.on("mouseout",function(d, i){
						if (obj.isClickSelected == true) return;
						return bP.deSelectSegment(data, p, i);
					})
					.on("click", function(d, i){
						if (p == 1) {
							if (p == obj.selectedPartID && i == obj.selectedItemID){
								obj.eventHandler.onCategoryChange(null);
								obj.otherItemID = null;
								//obj.showStatus();
							}
							else {
								obj.eventHandler.onCountryChange(d3.keys(obj.data[obj.selectedYear])[i]);
								if (obj.isClickSelected == false){
									obj.isClickSelected = true;
									obj.selectedPartID = p;
								}
								if (p == obj.selectedPartID){
									obj.selectedItemID = i;
								}
								else{
									obj.otherItemID = i;
								}
							}
						}
						else if (p == 0){
							if (p == obj.selectedPartID && i == obj.selectedItemID){
								obj.eventHandler.onCountryChange(null);
								obj.otherItemID = null;
								//obj.showStatus();
							}
							else {
								obj.eventHandler.onCategoryChange(d3.keys(obj.data[2005]["Canada"])[i]);
								//obj.eventHandler.onCountryChange(null);
								if (obj.isClickSelected == false){
									obj.isClickSelected = true;
									obj.selectedPartID = p;
								}
								if (p == obj.selectedPartID){
									obj.selectedItemID = i;
								}
								else{
									obj.otherItemID = i;
								}

							}
						}
						if (p == obj.selectedPartID){
							bP.releaseAll();
						}
						else{
							bP.releaseExceptFor(p, i);
							obj.otherItemID = i;
							bP.emphasize(p, i);
							obj.showStatus();
							return;
						}
						bP.selectSegment(data, p, i);
						//console.log("Other Item ID: " + self.otherItemID);
						//if (self.otherItemID == null)	return;
						bP.emphasize(1 - p, obj.otherItemID);
						obj.showStatus();
					});
					//.on("contextmenu", function(d, i){
					//	console.log("Right Click");
					//	console.log(obj.data);
					//	var InsertData = [];
					//	obj.data.forEach(function(dd, ii){
					//		if (p == 1) {
					//			InsertData.push(0);
					//			var country = d3.keys(dd[2005])[i];
                    //
					//		}
					//		else{
					//			InsertData.push(0);
					//			d.forEach(function(dd, ii){
                    //
					//			})
					//		}
					//	};
					//	//Show InsertData
					//	);
                    //
                    //
					//});
			});
		});
		d3.select("#Status")
			.on("click", function(){
				console.log("click")
				obj.isClickSelected = false;
				bP.releaseAll();
				data.forEach(function(k){
					transition(visualize(k.data), k.id);
				});
				obj.eventHandler.onCountryChange(null);
				obj.eventHandler.onCategoryChange(null);
				obj.selectedPartID = null;
				obj.selectedItemID = null;
				obj.otherItemID = null;
				obj.showStatus();
			});
	};

	bP.releaseExceptFor = function(p, i){
		var selectedBar = d3.select("#CountryCategories").select(".part"+p).select(".mainbars")
			.selectAll(".mainbar").filter(function(dd,ii){ return (ii!=i);});

		selectedBar.select(".mainrect").style("stroke-opacity",0);
		selectedBar.select(".barlabel").style('font-weight','normal');
		selectedBar.select(".barvalue").style('font-weight','normal');
		selectedBar.select(".barpercent").style('font-weight','normal');
	};

	bP.emphasize = function(p, i){
		var selectedBar = d3.select("#CountryCategories").select(".part"+p).select(".mainbars")
			.selectAll(".mainbar").filter(function(dd,ii){ return (ii==i);});

		selectedBar.select(".mainrect").style("stroke-opacity",1);
		selectedBar.select(".barlabel").style('font-weight','bold');
		selectedBar.select(".barvalue").style('font-weight','bold');
		selectedBar.select(".barpercent").style('font-weight','bold');
	};

	bP.releaseAll = function(){
		[0, 1].forEach(function(p){
			var selectBar = d3.select("#CountryCategories").select(".part" + p).select(".mainbars").selectAll(".mainbar");
			selectBar.selectAll(".mainrect").style("stroke-opacity",0);
			selectBar.selectAll(".barlabel").style('font-weight','normal');
			selectBar.selectAll(".barvalue").style('font-weight','normal');
			selectBar.selectAll(".barpercent").style('font-weight','normal');
		});
	};

	bP.selectSegment = function(data, m, s){
		//console.log("select");
		//console.log(data);
		data.forEach(function(k){
			var newdata =  {keys:[], data:[]};

			newdata.keys = k.data.keys.map( function(d){ return d;});

			newdata.data[m] = k.data.data[m].map( function(d){ return d;});

			newdata.data[1-m] = k.data.data[1-m]
				.map( function(v){ return v.map(function(d, i){ return (s==i ? d : 0);}); });

			transition(visualize(newdata), k.id);

			var selectedBar = d3.select("#"+k.id).select(".part"+m).select(".mainbars")
				.selectAll(".mainbar").filter(function(d,i){ return (i==s);});

			selectedBar.select(".mainrect").style("stroke-opacity",1);
			selectedBar.select(".barlabel").style('font-weight','bold');
			selectedBar.select(".barvalue").style('font-weight','bold');
			selectedBar.select(".barpercent").style('font-weight','bold');
		});
	};

	bP.deSelectSegment = function(data, m, s){
		data.forEach(function(k){
			transition(visualize(k.data), k.id);

			var selectedBar = d3.select("#"+k.id).select(".part"+m).select(".mainbars")
				.selectAll(".mainbar").filter(function(d,i){ return (i==s);});

			selectedBar.select(".mainrect").style("stroke-opacity",0);
			selectedBar.select(".barlabel").style('font-weight','normal');
			selectedBar.select(".barvalue").style('font-weight','normal');
			selectedBar.select(".barpercent").style('font-weight','normal');
		});
	};

	this.bP = bP;
}();
