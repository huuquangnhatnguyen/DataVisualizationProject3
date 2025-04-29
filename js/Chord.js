class ChordChart {
  /**
   * @param {Object} _config
   * @param {Object[]} _data
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 600,
      containerHeight: _config.containerHeight || 600,
      margin: _config.margin || { top: 10, right: 10, bottom: 10, left: 10 },
    };
    this.data = _data;
    this.initVis();
  }

  initVis() {
    const vis = this;

    // Set up dimensions and margins
    vis.width =
      vis.config.containerWidth -
      vis.config.margin.left -
      vis.config.margin.right;
    vis.height =
      vis.config.containerHeight -
      vis.config.margin.top -
      vis.config.margin.bottom;

    // Create the SVG container
    vis.svg = d3
      .select(vis.config.parentElement)
      .append("svg")
      .attr("width", vis.config.containerWidth)
      .attr("height", vis.config.containerHeight)
      .append("g")
      .attr(
        "transform",
        `translate(${vis.config.margin.left + vis.width / 2}, ${
          vis.config.margin.top + vis.height / 2
        })`
      );

    // // Create a matrix
    // const matrix = [
    //   [1130, 5871, 8916, 2868],
    //   [1951, 0, 2060, 6171],
    //   [8010, 16145, 0, 8045],
    //   [1013, 990, 940, 0],
    // ];
    let matrix = [];
    // fill matrix with the data
    for (let i = 0; i < this.data.length; i++) {
      matrix[i] = new Array(this.data.length).fill(0);
    }
    for (let i = 0; i < this.data.length; i++) {
      for (let j = 0; j < this.data.length; j++) {
        matrix[i][j] = this.data[i][j];
      }
    }

    // Define colors
    const colors = ["#440154ff", "#31668dff", "#37b578ff", "#fde725ff"];

    // Generate chord layout with matrix
    const res = d3.chord().padAngle(0.05).sortSubgroups(d3.descending)(matrix);

    // Add groups (arcs) to the outer part of the circle
    vis.svg
      .datum(res)
      .append("g")
      .selectAll("g")
      .data((d) => d.groups)
      .enter()
      .append("g")
      .append("path")
      .style("fill", (d, i) => colors[i])
      .style("stroke", "black")
      .attr(
        "d",
        d3
          .arc()
          .innerRadius(vis.width / 2 - 20)
          .outerRadius(vis.width / 2)
      );

    // Add ribbons (links between groups)
    vis.svg
      .datum(res)
      .append("g")
      .selectAll("path")
      .data((d) => d)
      .enter()
      .append("path")
      .attr("d", d3.ribbon().radius(vis.width / 2 - 20))
      .style("fill", (d) => colors[d.source.index])
      .style("stroke", "black");
  }
}
