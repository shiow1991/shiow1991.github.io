function DetailVis(_svg, _data) {
    var self = this;

    detailObj = this;

    self.svg = _svg;
    self.data = _data;
    self.selectedYear = 2014;
    self.selectedCountry = null;
    self.selectedCategory = null;
    self.selectedData = {};
    self.level = -1;
    self.previous = {};

    self.initVis();
}

DetailVis.prototype.initVis = function(){
    var self = detailObj;

    self.width = 550;
    self.height = 350;
    self.radius = Math.min(self.width, self.height) / 2;

    // create scales
    self.color = d3.scale.category20c();
    // ****************************
    // Global Color Scale Functions
    // ****************************
    ColorScale = self.color;

    self.xScale = d3.scale.linear().range([0, 2 * Math.PI]);
    self.yScale = d3.scale.linear().range([0, self.radius]);


    self.svg = self.svg.append("g").attr("transform", "translate(" + (self.width/2-50) + "," + self.height * .6 + ")");

    // partition layout
    self.partition = d3.layout.partition().sort(null)
        .value(function(d) { return d.size; });

    // arc
    self.arc = d3.svg.arc()
        .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, self.xScale(d.x))); })
        .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, self.xScale(d.x + d.dx))); })
        .innerRadius(function(d) { return Math.max(0, self.yScale(d.y)); })
        .outerRadius(function(d) { return Math.max(0, self.yScale(d.y + d.dy)); });


    // finished, update vis
    self.updateVis();
};


DetailVis.prototype.updateVis = function(){
    var self = detailObj;
    self.wrangleData();

    function arcTween(d) {
        var xd = d3.interpolate(self.xScale.domain(), [d.x, d.x + d.dx]),
            yd = d3.interpolate(self.yScale.domain(), [d.y, 1]),
            yr = d3.interpolate(self.yScale.range(), [d.y ? 20 : 0, self.radius]);
        return function (d, i) {
            return i ?
                function (t) {
                    return self.arc(d);
                }
                : function (t) {
                self.xScale.domain(xd(t));
                self.yScale.domain(yd(t)).range(yr(t));
                return self.arc(d);
            };
        };
    }

    function arcTweenData(d) {
        //console.log("Data:");
        //console.log(d);
        //console.log(self.previous[d.name][0]);
        //console.log(self.previous[d.name][1]);
        var p = {x:self.previous[d.name][0],dx:self.previous[d.name][1]};
        var inter = d3.interpolate(p, d);
        //console.log(self.previous[d.name][0]);
        //console.log(self.previous[d.name][1]);
        return function(t) {
            var b = inter(t);
            self.previous[d.name] = [b.x, b.dx];
            return self.arc(b);
        };
    }

    function click (d) {
        console.log("Click data:");
        console.log(d);
        if(d == self.selectedData)
            self.level = 0;
        else
            self.level = 1;
        path.transition()
            .duration(1000)
            .attrTween("d", arcTween(d));
    }

    function stash(d) {
        self.previous[d.name] = [d.x, d.dx];
        //d.x0 = d.x;
        //d.dx0 = d.dx;
    }

    function showInfo(d){
        //if(d.children){
        //    var total = 0;
        //    d.children.forEach(function(c){
        //        total += c.size;
        //    });
        //    console.log(d.name+","+total);
        //}
        //else{
        //    console.log(d.name + "," + d.size);
        //}
        self.stashedInfo = d3.select("#info").text();
        d3.select("#info").text(d.name+": "+ (d.size/1000000).toFixed(2)+" million");

    }

    //if(self.level == 0){
    //    self.svg.selectAll("path").transition.duration(800).remove();
    //}

    var path = self.svg.selectAll("path")
        .data(self.partition.nodes(self.selectedData));
    path.enter().append("path");
    path.exit().remove();

    colors_arr = [];
    colors_key = [];
    self.svg.selectAll("path").style("stroke", "#fff")
        .each(stash)
        .style("fill", function(d) {
            colors_key.push((d.children ? d : d.parent).name);
            colors_arr.push(self.color((d.children ? d : d.parent).name));
            return self.color((d.children ? d : d.parent).name);
        })
        .style("fill-rule", "evenodd")
        .on("click", click)
        .on("mouseover",showInfo)
        .on("mouseout",function(){
            d3.select("#info").text(self.stashedInfo);
        });
    path = self.svg.selectAll("path");

    // some trick to enable animation. not sure how to customize arcTween to satisfy my need
    if(self.level == -1){
        path.transition().duration(1000).attr("d",self.arc);
        self.level = 0;
    }
    else if(self.level == 0){
        path.transition().duration(1000).attrTween("d",arcTweenData);
    }
    else{
        path.transition().duration(1000).attrTween("d",arcTween(self.selectedData));
        self.level = 0;
    }
};

DetailVis.prototype.wrangleData = function(){
    var self = detailObj;

    var category = {
        "Foods": ["Wheat","Rice","Soybeans","Corn","Dairy products and eggs","Vegetables","Wine, beer, and related products","Fish and shellfish"],
        "Energy":["Fuel oil","Liquefied petroleum gases","Coal and related fuels","Gas-natural","Nuclear fuel materials","Electric energy"],
        "Industrial": ["Aluminum and alumina","Copper","Nonmonetary gold","Finished metal shapes","Pulpwood and woodpulp","Newsprint","Chemicals-organic"],
        "Machinery": ["Electric apparatus","Drilling & oilfield equipment","Excavating machinery","Industrial engines","Metalworking machine tools","Materials handling equipment"],
        "Household":["Household appliances","Rugs","Cell phones and other household goods","Pleasure boats and motors","Televisions and video equipment","Recorded media"]
    };

    var countries = ["China","Canada","Mexico","South Afric","United King","Japan","Philippines"];

    var data = self.data[self.selectedYear];
    if(self.selectedCountry === null){
        // show data for all countries in that year
        self.selectedData = {
            "name": "total",
            "children":[]
        };
        for(var k in category){
            if(category.hasOwnProperty(k)){
                var child = {
                    "name" :k,
                    "children": []
                }
                category[k].forEach(function(sub) {
                    var total = 0;
                    countries.forEach(function (c) {
                        if (data[c][k].hasOwnProperty(sub)) {
                            total += data[c][k][sub]["total"];
                        }
                    });
                    child["children"].push({"name": sub, "size":total});
                });
                var total = 0;
                child.children.forEach(function(d){
                    total += d.size;
                });
                child.size = total;
                self.selectedData["children"].push(child);
            }
        }
        var total = 0;
        self.selectedData.children.forEach(function(d){
            total += d.size;
        });
        self.selectedData.size = total;
    }
    else{
        data = data[self.selectedCountry];
        self.selectedData = {
            "name": "total",
            "children":[]
        };
        for(var k in category){
            if(category.hasOwnProperty(k)){
                var child = {
                    "name" :k,
                    "children": []
                }
                category[k].forEach(function(sub){
                    if(data[k].hasOwnProperty(sub)) {
                        child["children"].push({
                                "name": sub,
                                "size": data[k][sub]["total"]
                            }
                        );
                    }
                    else{
                        child["children"].push({
                                "name": sub,
                                "size": 0
                            }
                        );
                    }
                });
                var total = 0;
                child.children.forEach(function(d){
                    total += d.size;
                })
                child.size = total;
                self.selectedData["children"].push(child);
            }
        }
        var total = 0;
        self.selectedData.children.forEach(function(d){
            total += d.size;
        });
        self.selectedData.size = total;
    }
};

DetailVis.prototype.onYearChange = function(year){
    var self = detailObj;

    self.selectedYear = year;
    self.updateVis();

    if(! self.selectedCountry){
        d3.select("#info").text(self.selectedYear +" USA total import and export: "+Math.floor(self.selectedData["value"]/1000000000)+" billion");
    }
    else{
        d3.select("#info").text(self.selectedYear +" "+self.selectedCountry+" total import and export: "+Math.floor(self.selectedData["value"]/1000000000)+" billion")
    }
};

DetailVis.prototype.onCountryChange = function(country){
    var self = detailObj;

    self.selectedCountry = country;
    self.updateVis();

    if(! self.selectedCountry){
        d3.select("#info").text(self.selectedYear +" USA total import and export: "+ (self.selectedData["value"]/1000000000).toFixed(2)+" billion");
    }
    else{
        d3.select("#info").text(self.selectedYear +" "+self.selectedCountry+" to USA: "+(self.selectedData["value"]/1000000000).toFixed(2)+" billion")
    }
};

DetailVis.prototype.onCategoryChange = function(category){
    var self = detailObj;

    self.selectedCategory = category;
    self.svg.selectAll("path").forEach(function(d, i){
        if (d.name == category){
            self.updateVis().click(d);
        }
    });
};