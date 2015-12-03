function CountryVis(_svg, _data, _eventHandler) {
    var self = this;

    countryObj = this;

    self.svg = _svg;
    self.data = _data;
    self.selectedYear = 2014;
    self.selectedCountry = null;
    self.leftKeys = [];
    self.rightKeys = [];
    self.eventHandler = _eventHandler;
    self.isClickSelected = false;
    self.selectedData = {
        "keys": [],
        "data":[]
    };

    self.initVis();
}

CountryVis.prototype.initVis = function(){
    var self = countryObj;

    self.width = 550;
    self.height = 350;
    self.radius = Math.min(self.width, self.height) / 2;

    // create the same color scales
    self.color = ColorScale;

    self.svg = self.svg.append("g").attr("transform", "translate(" + self.width / 3 + "," + self.height * .12 + ")");

    // Initate Keys
    self.initiateKeys();

    //var colors_categories = ["#99CCCD", "#CDDD9C","#712975", "#EBD2E8", "#A7B4DE",  "#E9F0BA", "#B782B0"];
    var colors_categories = [];
    self.rightKeys.forEach(function(d){
        colors_categories.push(self.color(d));
    });

    bP.setColor(colors_categories);
    self.updateVis();
};


CountryVis.prototype.updateVis = function(){
    var self = countryObj;
    self.wrangleData();

    var data = [
        {data:self.selectedData, id:'CountryCategories', header:["Categories", "Country"]}
    ];
    console.log(self.selectedData);
    console.log(data);

    // Swap the key pairs
    temparr = data[0]["data"]["data"][0];
    data[0]["data"]["data"][0] = data[0]["data"]["data"][1];
    data[0]["data"]["data"][1] = temparr;
    temparr = data[0]["data"]["keys"][0];
    data[0]["data"]["keys"][0] = data[0]["data"]["keys"][1];
    data[0]["data"]["keys"][1] = temparr;

    bP.draw(data, self.svg, countryObj);
 };

CountryVis.prototype.wrangleData = function(){
    var self = countryObj;
    var select_year_data = self.data[self.selectedYear];

    // Initate Data
    self.initiateData();
};

CountryVis.prototype.initiateKeys = function(){
    var self = countryObj;
    self.leftKeys = d3.keys(self.data[self.selectedYear]);
    self.rightKeys = d3.keys(self.data[self.selectedYear][self.leftKeys[0]]);
    self.selectedData["keys"].push(self.leftKeys);
    self.selectedData["keys"].push(self.rightKeys);
};

CountryVis.prototype.initiateData = function(){
    var self = countryObj;
    var leftToRight = [];
    var rightToLeft = [];
    self.selectedData["data"] = [];
    // Get the value from left to right;
    console.log(self.data[self.selectedYear]);
    self.leftKeys.forEach(function(country){
        var inTheCountry = [];
        self.rightKeys.forEach(function(category){
            inTheCountry.push(self.data[self.selectedYear][country][category]["total"]["export"]
                                + self.data[self.selectedYear][country][category]["total"]["import"]);
        });
        leftToRight.push(inTheCountry);
    });
    self.selectedData["data"].push(leftToRight);

    // Get the data from right to left;
    self.rightKeys.forEach(function(category){
        var inTheCategory = [];
        self.leftKeys.forEach(function(country){
            inTheCategory.push(self.data[self.selectedYear][country][category]["total"]["export"]
                + self.data[self.selectedYear][country][category]["total"]["import"]);
        });
        rightToLeft.push(inTheCategory);
    });
    self.selectedData["data"].push(rightToLeft);
};


CountryVis.prototype.onYearChange = function(year){
    var self = countryObj;
    self.selectedYear = year;
    self.updateVis();

};