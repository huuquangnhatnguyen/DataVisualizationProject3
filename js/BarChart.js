class BarChart {
  /**
   * @param {Object} config - Chart configuration
   * @param {Array} rawData - Raw CSV data
   * @param {Object} options - Visualization options
   * @param {string[]} mainCharacters - Array of main characters
   */

  constructor(config, rawData, mainCharacters, options) {
    this.config = {
      parentElement: config.parentElement,
      containerWidth: config.containerWidth || 400,
      containerHeight: config.containerHeight || 300,
      margin: { top: 20, right: 20, bottom: 40, left: 50 },
      // field: options.field || "mag",
      // label: options.label || "Magnitude",
      color: options.color || "steelblue",
      // binStep: options.binStep || 0.5,
      // units: options.units || "",
      hoverColor: options.hoverColor || "var(--selection-color)",
      // onBinSelected: options.onBinSelected || null, // Added: callback for bin selection
    };
    this.data = rawData;
    this.options = options;
    this.chart = null;
    this.mainCharacters = mainCharacters;
    this.initVis();
  }

  initVis() {
    const vis = this;

    vis.setupDimensions();
    // Create visualization elements
    vis.createScales();
    vis.drawAxes();
    vis.drawBars();
    vis.addLabels();
  }

  setupDimensions() {
    const vis = this;

    vis.width =
      vis.config.containerWidth -
      vis.config.margin.left -
      vis.config.margin.right;
    vis.height =
      vis.config.containerHeight -
      vis.config.margin.top -
      vis.config.margin.bottom;

    vis.svg = d3
      .select(vis.config.parentElement)
      .append("svg")
      .attr(
        "width",
        vis.width + vis.config.margin.left + vis.config.margin.right
      )
      .attr(
        "height",
        vis.height + vis.config.margin.top + vis.config.margin.bottom
      )
      .append("g")
      .attr(
        "transform",
        `translate(${vis.config.margin.left},${vis.config.margin.top})`
      );
  }

  createScales() {
    const vis = this;
    vis.xScale = d3
      .scaleBand()
      .domain(vis.data.map((d) => d.topic_label))
      .padding(0.1)
      .range([0, vis.width]);

    vis.yScale = d3
      .scaleLinear()
      .domain([0, d3.max(vis.data, (d) => d.n)])
      .range([vis.height, 0]);
  }
  drawAxes() {
    const vis = this;

    // X-axis
    vis.xAxis = vis.svg
      .append("g")
      .attr("class", "axis x-axis")
      .attr("transform", `translate(10,${vis.height})`)
      .call(d3.axisBottom(vis.xScale));

    // Y-axis
    vis.yAxis = vis.svg
      .append("g")
      .attr("class", "axis y-axis")
      .attr("transform", "translate(10,0)") // Adjust for x-axis offset
      .call(d3.axisLeft(vis.yScale));
  }

  drawBars() {
    const vis = this;

    vis.bar = vis.svg
      .selectAll(".bar")
      .data(vis.data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => vis.xScale(d.topic_label) + 10)
      .attr("width", vis.xScale.bandwidth())

      .attr("y", (d) => vis.yScale(d.n))
      .attr("height", (d) => vis.height - vis.yScale(d.n))
      .attr("fill", vis.config.color)
      .attr("opacity", 0.8);
    //   });
    //   .on("mouseover", function (event, d) {
    //     // Modified: only change color if not selected
    //     if (!vis.selectedBins.some((b) => b.x0 === d.x0 && b.x1 === d.x1)) {
    //       d3.select(this).attr("fill", vis.config.hoverColor);
    //     }
    //     vis.showTooltip(event, d);
    //   })
    //   .on("mouseout", function (event, d) {
    //     // Modified: only revert if not selected
    //     if (!vis.selectedBins.some((b) => b.x0 === d.x0 && b.x1 === d.x1)) {
    //       d3.select(this).attr("fill", vis.config.color);
    //     }
    //     vis.hideTooltip();
    //   })
    //   .on("mousemove", (event) => {
    //     d3.select("#tooltip")
    //       .style("left", event.pageX + 10 + "px")
    //       .style("top", event.pageY + 10 + "px");
    //   })
    //   .on("click", function (event, d) {
    //     // Added: click handler for bin selection
    //     if (vis.config.onBinSelected) {
    //       vis.config.onBinSelected(
    //         {
    //           field: vis.config.field,
    //           x0: d.x0,
    //           x1: d.x1,
    //         },
    //         event
    //       );
    //     }
    //   });
  }
  addLabels() {
    const vis = this;

    // X-axis label
    vis.svg
      .append("text")
      .attr("class", "axis-label")
      .attr("x", vis.width / 2)
      .attr("y", vis.height + 35)
      .attr("fill", "var(--text-color)")
      .attr("text-anchor", "middle")
      .text("Topics");

    // Y-axis label
    vis.svg
      .append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -vis.height / 2)
      .attr("y", -35)
      .attr("fill", "var(--text-color)")
      .attr("text-anchor", "middle")
      .text("Count");
  }
  updateVis(newData, color) {
    const vis = this;
    vis.data = newData;
    vis.config.color = color || vis.config.color;
    // vis.svg.remove();
    vis.bar.remove();
    vis.xAxis.remove();
    vis.yAxis.remove();

    // Set up dimensions
    // vis.setupDimensions();

    // Create visualization elements
    vis.createScales();
    vis.drawAxes();
    vis.drawBars();
    vis.addLabels();
  }
}
