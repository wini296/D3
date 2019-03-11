var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

function xLabelsObj(xGrp) {
    // function used to create all x labels and return dict object

    var povertyLabel = xGrp.append("text")
        .attr("y", 20)
        .text("In Poverty (%)");

    var ageLabel = xGrp.append("text")
        .attr("y", 40)
        .text("Age (median)");

    var incomeLabel = xGrp.append("text")
        .attr("y", 60)
        .text("Houshold Income (median)");

    // create object dict with all labels
    var lblObj = {
        poverty: povertyLabel,
        age: ageLabel,
        income: incomeLabel,
    };

    Object.entries(lblObj).forEach(([k, v]) => {
        v.attr("value", k) // value to grab for event listener
            .attr("x", 0)
            .classed("aText", true);
    });

    return lblObj;
}

function yLabelsObj(yGrp) {
    // function used to create all y labels and return dict object

    var obesityLabel = yGrp.append("text")
        .attr("y", 0 - margin.left)
        .text("Obese (%)");

    var smokesLabel = yGrp.append("text")
        .attr("y", 20 - margin.left)
        .text("Smokes (%)");

    var healthcareLabel = yGrp.append("text")
        .attr("y", 40 - margin.left)
        .text("Lacks Healthcare (%)");

    // create object dict with all labels
    var lblObj = {
        obesity: obesityLabel,
        smokes: smokesLabel,
        healthcare: healthcareLabel,
    };

    Object.entries(lblObj).forEach(([k, v]) => {
        v.attr("value", k) // value to grab for event listener
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .classed("aText", true);
    });

    return lblObj;
}

function xScale(data, xAxisStr, xLbl) {
    // function used for updating x-scale var upon click on axis label

    // create scales
    var xXScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[xAxisStr] - 1), d3.max(data, d => d[xAxisStr] + 1)])
        .range([0, width]);

    // set all inactive
    Object.values(xLbl).forEach(lbl => {
        lbl.classed("active", false)
            .classed("inactive", true);
    });

    // changes classes to change bold text
    xLbl[xAxisStr].classed("active", true)
        .classed("inactive", false);

    return xXScale;
}

function yScale(data, yAxisStr, yLbl) {
    // function used for updating x-scale var upon click on axis label

    // create scales
    var yYScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[yAxisStr] - 2), d3.max(data, d => d[yAxisStr] + 2)])
        .range([height, 0]);

    // set all inactive
    Object.values(yLbl).forEach(lbl => {
        lbl.classed("active", false)
            .classed("inactive", true);
    });

    // changes classes to change bold text
    yLbl[yAxisStr].classed("active", true)
        .classed("inactive", false);

    return yYScale;
}

function renderXAxis(newXScale, xAx) {
    // function used for updating xAxis var upon click on axis label

    xAx.transition()
        .duration(1000)
        .call(d3.axisBottom(newXScale));

    return xAx;
}

function renderYAxis(newYScale, yAx) {
    // function used for updating yAxis var upon click on axis label

    yAx.transition()
        .duration(1000)
        .call(d3.axisLeft(newYScale));

    return yAx;
}

function renderCircles(circlesGroup, newXScale, xAxisStr, newYScale, yAxisStr) {
    // function used for updating circles group with a transition to new circles

    circlesGroup
        .attr("ctx", d => newXScale(d[xAxisStr]))
        .attr("cty", d => newXScale(d[yAxisStr]))
        .selectAll(function (d) {
            d3.selectAll(this.childNodes).transition()
                .duration(1000)
                .attr("cx", d => newXScale(d[xAxisStr]))
                .attr("x", d => newXScale(d[xAxisStr]))
                .attr("cy", d => newYScale(d[yAxisStr]))
                .attr("y", d => newYScale(d[yAxisStr]));
        });

    return circlesGroup;
}

function updateToolTip(circlesGroup, xAxisStr, xLbl, yAxisStr, yLbl) {
    // function used for updating circles group with new tooltip

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function (d) {
            return (`<b>${d.state}</b><br>${xLbl[xAxisStr].text()}: ${d[xAxisStr]}<br>${yLbl[yAxisStr].text()}: ${d[yAxisStr]}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function (d) {
        toolTip.show(d, this);
        // onmouseout event
    }).on("mouseout", function (d) {
        toolTip.hide(d);
    });

    return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function (acsData) {

    // Initial Params
    var chosenXAxis = "poverty";
    var chosenYAxis = "obesity";

    // parse data
    acsData.forEach(data => {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
    });

    // Append an SVG group
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Create group for all x-axis labels
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`)

    var xLabels = xLabelsObj(xLabelsGroup);

    // set x-scale and label active-state
    var xLinearScale = xScale(acsData, chosenXAxis, xLabels);

    // Create group for all y-axis labels
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)");

    var yLabels = yLabelsObj(yLabelsGroup);

    // set y-scale and label active-state
    var yLinearScale = yScale(acsData, chosenYAxis, yLabels);

    var circlesGroup = chartGroup.selectAll("g")
        .data(acsData)
        .enter()
        .append("g")
        .attr("ctx", d => xLinearScale(d[chosenXAxis]))
        .attr("cty", d => yLinearScale(d[chosenYAxis]));

    // append initial circles
    var cGroup = circlesGroup.append("circle")
        .classed("stateCircle", true)
        .attr("r", 20);

    // append initial text
    var tGroup = circlesGroup.append("text")
        .classed("stateText", true)
        .attr("dy", ".35em")
        .text(d => d.abbr);

    // update coordinates for circles and text
    circlesGroup.selectAll(function () {
        d3.selectAll(this.childNodes)
            .attr("cx", function () { return d3.select(this.parentNode).attr("ctx") })
            .attr("cy", function () { return d3.select(this.parentNode).attr("cty") })
            .attr("x", function () { return d3.select(this.parentNode).attr("ctx") })
            .attr("y", function () { return d3.select(this.parentNode).attr("cty") });
    });

    // append x-axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xLinearScale));

    // append y-axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(d3.axisLeft(yLinearScale));

    // update ToolTip
    var circlesGroup = updateToolTip(circlesGroup, chosenXAxis, xLabels, chosenYAxis, yLabels);

    // x-axis labels event listener
    xLabelsGroup.selectAll("text").on("click", function () {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

            // replaces chosenXaxis with value
            chosenXAxis = value;

            // updates x-scale and labels for new data
            xLinearScale = xScale(acsData, chosenXAxis, xLabels);

            // updates x-axis with transition
            xAxis = renderXAxis(xLinearScale, xAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)
                // updates tooltips with new info
                .updateToolTip(circlesGroup, chosenXAxis, xLabels, chosenYAxis, yLabels);
        }
    });

    // y-axis labels event listener
    yLabelsGroup.selectAll("text").on("click", function () {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {

            // replaces chosenYaxis with value
            chosenYAxis = value;

            // updates y-scale and labels for new data
            yLinearScale = yScale(acsData, chosenYAxis, yLabels);

            // updates y-axis with transition
            yAxis = renderYAxis(yLinearScale, yAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)
                // updates tooltips with new info
                .updateToolTip(circlesGroup, chosenXAxis, xLabels, chosenYAxis, yLabels);
        }
    })
});