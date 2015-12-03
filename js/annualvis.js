function AnnualVis(_svg, _data,_eventHandler) {
    var self = this;

    annualObj = this;

    self.svg = _svg;
    self.data = _data;
    self.displayData = [];
    self.eventHandler = _eventHandler;


    self.initVis();
}

AnnualVis.prototype.initVis = function(){
    var self = annualObj;
    self.graphW = 900;
    self.graphH = 250;

    // scale and axises
    self.xScale = d3.time.scale().range([0, self.graphW]);
    self.yScale = d3.scale.linear().range([self.graphH, 0]);
    self.xAxis = d3.svg.axis().scale(self.xScale);
    self.yAxis = d3.svg.axis().scale(self.yScale).orient("left");

    // the visual group
    self.visG = self.svg.append("g").attr({
        "transform": "translate(" + 80 + "," + 10 + ")"
    });

    // group for axises
    self.visG.append("g").attr("class", "xAxis axis").attr("transform", "translate(0," + self.graphH + ")");
    self.visG.append("g").attr("class", "yAxis axis");

    self.wrangleData();

    self.xScale.domain([new Date(2005, 0, 0, 0, 0, 0, 0), new Date(2015, 0, 0, 0, 0, 0, 0)]).nice();
    self.yScale.domain([0,d3.max(self.displayData.map(function(d){
        // what is the unit
        return d.export > d.import ? d.export : d.import;
    }))]).nice();

    self.updateVis();
};

AnnualVis.prototype.wrangleData = function(){
    var self = this;

    var arr = [];
    for(var k in self.data){
        if(self.data.hasOwnProperty(k))
            arr.push(self.data[k]);
    }
    self.displayData = arr;
};

AnnualVis.prototype.updateVis = function(){
    var self = annualObj;

    // update axis
    self.yAxis.scale(self.yScale);
    self.xAxis.scale(self.xScale);

    // draw the scales :
    self.visG.select(".xAxis").call(self.xAxis);
    self.visG.select(".yAxis").call(self.yAxis);

    var importLineGenerator = d3.svg.line()
        .x(function (d, i) {
            return self.xScale(new Date(i+2005,0, 0, 0, 0, 0, 0));
        })
        .y(function (d) {
            return self.yScale(d.import);
        });

    var exportLineGenerator = d3.svg.line()
        .x(function (d, i) {
            return self.xScale(new Date(i+2005,0, 0, 0, 0, 0, 0));
        })
        .y(function (d) {
            return self.yScale(d.export);
        });

    self.svg.select("#import_path").attr("d",importLineGenerator(self.displayData));
    self.svg.select("#export_path").attr("d",exportLineGenerator(self.displayData));

    self.svg.select("#annual_graph").append("g").selectAll("circle").data(self.displayData).enter().append("circle")
        .attr("cx",function(d,i){
            return self.xScale(new Date(i+2005,0, 0, 0, 0, 0, 0));
        })
        .attr("cy",function(d){
            return self.yScale(d.import);
        })
        .attr("r","5")
        .classed("import_point",true)
        .on("click",function(d,i){
            self.eventHandler.onYearChange(i+2005);
        })
        .on("mouseover",function(){
            d3.select(this).transition().duration(300).attr("r","7");
            var x = d3.select(this).attr("cx");
            self.svg.select("#annual_graph").append("line")
                .attr("x1",parseFloat(x))
                .attr("x2",parseFloat(x))
                .attr("y1",0)
                .attr("y2",self.graphH)
                .attr("id","helpLine")
                .style("stroke","#5184AF")
                .style("stroke-width","2px")
                .style("stroke-dasharray", ("3, 3"));
        })
        .on("mouseout",function(){
            d3.select(this).transition().duration(300).attr("r","5");
            self.svg.select("#helpLine").remove();
        });

    self.svg.select("#annual_graph").append("g").selectAll("circle").data(self.displayData).enter().append("circle")
        .attr("cx",function(d,i){
            return self.xScale(new Date(i+2005,0, 0, 0, 0, 0, 0));
        })
        .attr("cy",function(d){
            return self.yScale(d.export);
        })
        .attr("r","5")
        .classed("export_point",true)
        .on("click",function(d,i){
            self.eventHandler.onYearChange(i+2005);
        })
        .on("mouseover",function(){
            d3.select(this).transition().duration(300).attr("r","7");
            var x = d3.select(this).attr("cx");
            self.svg.select("#annual_graph").append("line")
                .attr("x1",parseFloat(x))
                .attr("x2",parseFloat(x))
                .attr("y1",0)
                .attr("y2",self.graphH)
                .attr("id","helpLine")
                .style("stroke","#5184AF")
                .style("stroke-width","2px")
                .style("stroke-dasharray", ("3, 3"));
        })
        .on("mouseout",function(){
            d3.select(this).transition().duration(300).attr("r","5");
            self.svg.select("#helpLine").remove();
        });
};