
(function () {
    var annualData, countryData;

    function initVis() {
        var eventhandler = d3.dispatch("onYearChange","onCountryChange");
        var annualVis = new AnnualVis(d3.select("#annual"), annualData, eventhandler);
        var detailVis = new DetailVis(d3.select("#detail"), countryData);
        var countryVis = new CountryVis(d3.select("#country"), countryData, eventhandler);

        eventhandler.on("onYearChange.detailVis",detailVis.onYearChange);
        eventhandler.on("onCountryChange.detailVis",detailVis.onCountryChange);
        eventhandler.on("onYearChange.countryVis",countryVis.onYearChange);
    }

    // call this function after both files are loaded -- error should be "null" if no error
    function dataLoaded(error, _annualData, _countryData) {
        if (!error) {
            annualData = _annualData;
            countryData = _countryData;
            initVis();
        }
    }

    function startHere() {
        queue().defer(d3.json,"data/json/annual_export_import.json")
            .defer(d3.json,"data/json/annual_data_for_country.json")
            .await(dataLoaded);
    }

    startHere();
})();
