class StackAreaChart {
  /**
   * @param {Object} _config
   * @param {Object[]} _data
   *@param
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 600,
      containerHeight: _config.containerHeight || 400,
      margin: _config.margin || { top: 20, right: 30, bottom: 30, left: 40 },
    };

    // Set the data
    this.data = _data;

    //Intialize the chart
    this.initVis();
  }

  initVis() {
    let vis = this;
    // console.log("initVis", this.config, this.data);

    var sumstat = d3
      .nest()
      .key(function (d) {
        return d.year;
      })
      .entries(data);

    // console.log(sumstat);

    let hierarchyData = d3.hierarchy(
      { name: "root", children: this.data },
      (d) => d.children
    );
    console.log(hierarchyData.leaves());

    vis.oneEpisode = this.data[0].children;
    // console.log(vis.oneEpisode);
    // Set the dimensions of the chart
    this.width =
      this.config.containerWidth -
      this.config.margin.left -
      this.config.margin.right;
    this.height =
      this.config.containerHeight -
      this.config.margin.top -
      this.config.margin.bottom;

    // Create the SVG element
    this.svg = d3
      .select(this.config.parentElement)
      .append("svg")
      .attr("width", this.config.containerWidth)
      .attr("height", this.config.containerHeight);

    // Create a group element for the chart
    this.chartGroup = this.svg
      .append("g")
      .attr(
        "transform",
        `translate(${this.config.margin.left}, ${this.config.margin.top})`
      );

    this.renderVis();
  }
  renderVis() {
    let vis = this;
    // Set the x and y scales
    var x = d3
      .scaleBand()
      .domain(vis.oneEpisode.map((d) => d.character))
      .range([0, vis.width])
      .padding(0.1);

    var y = d3
      .scaleLinear()
      .domain([0, d3.max(vis.oneEpisode, (d) => d.dialogueCount)])
      .range([vis.height, 10]);

    // Create the x and y axes
    var xAxis = d3.axisBottom(x).tickFormat((d) => d);
    var yAxis = d3.axisLeft(y).ticks(5);
    // Append the x and y axes to the chart group
    vis.svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(${vis.config.margin.left}, ${vis.height})`)
      .call(xAxis);

    vis.chartGroup
      .append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(0, -${vis.config.margin.top})`)
      .call(yAxis);

    // Create the bars for the chart
    vis.chartGroup
      .append("path")
      .datum(vis.oneEpisode)
      .attr("transform", `translate(0, -${vis.config.margin.top})`)
      .attr("fill", "#cce5df")
      .attr("stroke", "#69b3a2")
      .attr("stroke-width", 1.5)
      .attr("class", "line")
      .attr(
        "d",
        d3
          .area()
          .x((d) => x(d.character) + x.bandwidth() / 2)
          .y0((d) => y(0))
          .y1((d) => y(d.dialogueCount))
      );
    vis.chartGroup
      .append("text")
      .attr("text-anchor", "end")
      .attr("x", width)
      .attr("y", -margin.top)
      .text("X axis title");
  }
}
