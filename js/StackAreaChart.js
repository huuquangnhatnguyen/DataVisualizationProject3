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
    console.log("initVis", this.config, this.data);
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
  }
}
