class StackAreaChart {
  /**
   * @param {Object} _config
   * @param {Object[]} _data
   * @param {string[]} _mainCharacters
   */
  constructor(_config, _data, _mainCharacters) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 600,
      containerHeight: _config.containerHeight || 400,
      margin: _config.margin || { top: 40, right: 30, bottom: 50, left: 60 }, // Increased margins for titles
      legendWidth: 120,
      tooltipPadding: 10,
      chartTitle: _config.chartTitle || "Character Dialogue Distribution",
      xAxisTitle: _config.xAxisTitle || "Episode",
      yAxisTitle: _config.yAxisTitle || "Number of Lines",
    };

    // Set the data
    this.data = _data;
    this.mainCharacters = _mainCharacters;

    // Initialize the chart
    this.initVis();
  }

  initVis() {
    let vis = this;
    // Set the dimensions of the chart
    this.width =
      this.config.containerWidth -
      this.config.margin.left -
      this.config.margin.right -
      this.config.legendWidth;
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

    // Add chart title
    this.svg
      .append("text")
      .attr("class", "chart-title")
      .attr("x", this.config.containerWidth / 2)
      .attr("y", this.config.margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "var(--text-color)")
      .text(this.config.chartTitle);

    // Create tooltip div if it doesn't exist
    this.tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "1px solid #ddd")
      .style("padding", "10px")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("box-shadow", "0 0 10px rgba(0,0,0,0.1)");

    this.renderVis();
  }

  renderVis() {
    let vis = this;
    let data = this.data;

    // Clear any previous elements to avoid duplication
    vis.chartGroup
      .selectAll(".x-axis,.y-axis,.layer,.episode-line,.axis-title")
      .remove();

    // Set the x and y scales
    var x = d3
      .scaleLinear()
      .domain([0, data.length + 1])
      .range([0, vis.width]);
    var y = d3
      .scaleLinear()
      .domain([0, calculatingYMax(data, this.mainCharacters)])
      .range([vis.height, 0]);

    // Create the x and y axes
    var xAxis = d3.axisBottom(x).tickFormat((d) => Math.round(d));
    var yAxis = d3.axisLeft(y).ticks(5);

    // Append the x and y axes to the chart group
    vis.chartGroup
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${vis.height})`)
      .call(xAxis);

    vis.chartGroup.append("g").attr("class", "y-axis").call(yAxis);

    // Add X axis title
    vis.chartGroup
      .append("text")
      .attr("class", "axis-title x-axis-title")
      .attr("text-anchor", "middle")
      .attr("x", vis.width / 2)
      .attr("y", vis.height + 35) // Position below x-axis
      .style("fill", "var(--text-color)")
      .text(vis.config.xAxisTitle);

    // Add Y axis title
    vis.chartGroup
      .append("text")
      .attr("class", "axis-title y-axis-title")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("x", -vis.height / 2)
      .attr("y", -40) // Position to the left of y-axis
      .style("fill", "var(--text-color)")
      .text(vis.config.yAxisTitle);

    // Add vertical dotted lines for each episode
    if (data.length > 0) {
      for (let i = 1; i <= data.length; i++) {
        vis.chartGroup
          .append("line")
          .attr("class", "episode-line")
          .attr("x1", x(i))
          .attr("y1", 0)
          .attr("x2", x(i))
          .attr("y2", vis.height)
          .style("stroke", "white")
          .style("stroke-width", 0.9)
          .style("stroke-dasharray", "3,3")
          .style("opacity", 0.5);
      }
    }

    // Create color scale
    var color = d3
      .scaleOrdinal()
      .domain(this.mainCharacters)
      .range([
        "#FF6B6B",
        "#4DABF7",
        "#69DB7C",
        "#B197FC",
        "#FFA94D",
        "#FFD43B",
        "#38D9A9",
      ]);

    // Stack data
    const stack = d3.stack().keys(this.mainCharacters)(data);

    // Create the areas for the chart
    const layers = vis.chartGroup
      .selectAll(".layer")
      .data(stack)
      .enter()
      .append("path")
      .attr("class", (d) => `layer ${d.key.replace(/\s+/g, "-").toLowerCase()}`)
      .style("fill", (d) => color(d.key))
      .style("opacity", 0.6)
      .attr(
        "d",
        d3
          .area()
          .x((d) => x(d.data.episode))
          .y0((d) => y(d[0]))
          .y1((d) => y(d[1]))
      );

    // Add hover effects
    layers
      .on("mouseover", function (event, d) {
        // Highlight current layer
        d3.select(this)
          .style("opacity", 1)
          .style("stroke", "#000")
          .style("stroke-width", 1);

        // Highlight legend item
        d3.select(
          `.legend-item-${d.key.replace(/\s+/g, "-").toLowerCase()}`
        ).style("font-weight", "bold");

        // Show tooltip
        vis.tooltip.transition().duration(200).style("opacity", 0.9);
      })
      .on("mousemove", function (event, d) {
        // Get mouse position
        const xPos = d3.pointer(event)[0];
        const index = Math.round(x.invert(xPos));

        // Ensure index is in bounds
        if (index >= 0 && index < data.length) {
          const currentData = data[index];
          const value = currentData[d.key];

          // Position and update tooltip content
          vis.tooltip
            .style("left", event.pageX + vis.config.tooltipPadding + "px")
            .style("top", event.pageY + vis.config.tooltipPadding + "px").html(`
              <strong style="color: ${color(d.key)}">${d.key}</strong><br>
              <div style="color: black; margin: 0; margin-bottom: 2px">Episode: ${
                currentData.episode
              }</div>
              <div style="color: black; margin: 0; margin-bottom: 2px">Number of Lines: ${value}</div>
            `);
        }
      })
      .on("mouseout", function (event, d) {
        // Restore original appearance
        d3.select(this).style("opacity", 0.6).style("stroke", "none");

        // Restore legend item
        d3.select(
          `.legend-item-${d.key.replace(/\s+/g, "-").toLowerCase()}`
        ).style("font-weight", "normal");

        // Hide tooltip
        vis.tooltip.transition().duration(500).style("opacity", 0);
      });

    // Add legend
    this.addLegend(color);
  }

  addLegend(colorScale) {
    let vis = this;

    // Remove any existing legend
    vis.svg.selectAll(".legend").remove();

    // Create legend group
    const legend = vis.svg
      .append("g")
      .attr("class", "legend")
      .attr(
        "transform",
        `translate(${vis.width + vis.config.margin.left + 20}, ${
          vis.config.margin.top + 10
        })`
      );

    // Add legend entries
    const legendItems = legend
      .selectAll(".legend-item")
      .data(vis.mainCharacters)
      .enter()
      .append("g")
      .attr(
        "class",
        (d) => `legend-item legend-item-${d.replace(/\s+/g, "-").toLowerCase()}`
      )
      .attr("transform", (d, i) => `translate(0, ${i * 20})`)
      .style("cursor", "pointer");

    // Add colored rectangles
    legendItems
      .append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", (d) => colorScale(d));

    // Add text labels
    legendItems
      .append("text")
      .attr("x", 20)
      .attr("y", 10)
      .text((d) => d)
      .style("font-size", "12px")
      .style("fill", "var(--text-color)");

    // Add legend title
    legend
      .append("text")
      .attr("class", "legend-title")
      .attr("x", 0)
      .attr("y", -10)
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", "var(--text-color)")
      .text("Characters");

    // Add interactivity to legend
    legendItems
      .on("mouseover", function (event, d) {
        // Highlight corresponding area
        d3.select(`.${d.replace(/\s+/g, "-").toLowerCase()}`)
          .style("opacity", 1)
          .style("stroke", "#000")
          .style("stroke-width", 1);

        // Highlight legend item
        d3.select(this).style("font-weight", "bold");
      })
      .on("mouseout", function (event, d) {
        // Restore area
        d3.select(`.${d.replace(/\s+/g, "-").toLowerCase()}`)
          .style("opacity", 0.8)
          .style("stroke", "none");

        // Restore legend item
        d3.select(this).style("font-weight", "normal");
      });
  }

  updateVis() {
    // Clear previous chart before redrawing
    this.chartGroup
      .selectAll(".layer, .x-axis, .y-axis, .episode-line, .axis-title")
      .remove();
    this.svg.selectAll(".chart-title").remove();

    // Re-add chart title
    this.svg
      .append("text")
      .attr("class", "chart-title")
      .attr("x", this.config.containerWidth / 2)
      .attr("y", this.config.margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", "var(--text-color)")
      .text(this.config.chartTitle);

    this.renderVis();
  }
}

function calculatingYMax(data, mainCharacters) {
  let tempMax = 0;
  data.forEach((child) => {
    let tempSum = 0;
    mainCharacters.map((character) => {
      tempSum += Number(child[character]);
    });
    tempMax = tempMax < tempSum ? tempSum : tempMax;
  });
  return tempMax;
}
