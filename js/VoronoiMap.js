/**
 * VoronoiMap - A class for creating a D3 Voronoi treemap visualization
 */
class VoronoiMap {
  /**
   * Constructor for the VoronoiMap
   * @param {string} selector - CSS selector for the SVG element
   * @param {Object} config - Optional configuration options for the visualization
   */
  constructor(selector, config = null) {
    this.selector = selector;

    // Default configuration
    this.config = config || {
      svgWidth: 960,
      svgHeight: 500,
      margin: { top: 10, right: 10, bottom: 10, left: 10 },
      baseRadius: 210,
    };

    // Color scale for character data
    this.colorScale = d3
      .scaleOrdinal()
      .range([
        "#FF6B6B",
        "#4DABF7",
        "#69DB7C",
        "#B197FC",
        "#FFA94D",
        "#FFD43B",
        "#38D9A9",
      ]);

    // Constants
    this._2PI = 2 * Math.PI;

    // Calculate dimensions based on margins
    this.width =
      this.config.svgWidth - this.config.margin.left - this.config.margin.right;
    this.height =
      this.config.svgHeight -
      this.config.margin.top -
      this.config.margin.bottom;

    // Center position for the treemap
    this.treemapCenter = [this.width / 2, this.height / 2];

    // Initialize properties
    this.svg = null;
    this.drawingArea = null;
    this.container = null;
    this.radius = this.config.baseRadius;
    this.circlingPolygon = null;
    this.polygons = null;
    this.simulation = null;
    this.data = null;
    this.totalCost = 0;
  }

  /**
   * Initialize the visualization - setup SVG and containers
   */
  initVis() {
    // Setup SVG element
    this.svg = d3
      .select(this.selector)
      .attr("width", this.config.svgWidth)
      .attr("height", this.config.svgHeight);

    // Create shadow filter definition
    this.createShadowFilter();

    // Setup main drawing area with margins
    this.drawingArea = this.svg
      .append("g")
      .classed("drawingArea", true)
      .attr(
        "transform",
        `translate(${this.config.margin.left},${this.config.margin.top})`
      );

    // Create container for the treemap at center
    this.container = this.drawingArea
      .append("g")
      .classed("treemap-container", true)
      .attr(
        "transform",
        `translate(${this.treemapCenter[0]},${this.treemapCenter[1]})`
      );

    // Setup container structure
    this.setupContainerStructure();

    // Compute circling polygon
    this.circlingPolygon = this.computeCirclingPolygon(this.radius);

    // Draw the legend container
    this.legendContainer = this.drawingArea
      .append("g")
      .classed("legend", true)
      .attr("transform", `translate(0, ${this.height - 20})`);
  }

  /**
   * Update the visualization with new data
   * @param {Object} dataObj - Object containing data array and totalCost
   */
  updateVis(dataObj) {
    // Store data and total cost
    this.data = dataObj.data;
    this.totalCost = dataObj.totalCost;
    // Update the total cost display
    this.container
      .select(".total-cost")
      .attr("fill", "var(--text-color)")
      .attr("margin-bottom", "5px")
      .text(`${this.totalCost} lines in total`); // title of the chart

    // Create or update legends
    this.updateLegends(this.data);

    // Create simulation with the new data
    this.simulation = d3
      .voronoiMapSimulation(this.data)
      .clip(this.circlingPolygon)
      .weight((d) => d.cost) //this for taking the value
      .initialPosition(
        d3.voronoiMapInitialPositionPie().startAngle(-Math.PI / 2)
      )
      .on("tick", () => {
        // Update polygons on each tick
        this.polygons = this.simulation.state().polygons;
        this.renderVis();
      })
      .on("end", () => {
        // Attach mouse listeners when simulation ends
        this.attachMouseListeners(this.data);
      });

    // Option to render statically without animation
    const simulate = true;
    if (!simulate) {
      this.simulation.stop();

      while (!this.simulation.state().ended) {
        this.simulation.tick();
      }

      this.polygons = this.simulation.state().polygons;
      this.renderVis();
      this.attachMouseListeners(this.data);
    }
  }

  /**
   * Update with new data from a CSV file
   * @param {string} csvPath - Path to the CSV file
   * @param {function} processDataFn - Function to process the data
   */
  updateWithNewData(csvPath = "../data/ss1-total-lines.csv", processDataFn) {
    d3.csv(csvPath)
      .then((data) => {
        console.log("Data loaded:", data);
        const processedData = processDataFn(data, this.colorScale);
        console.log("Processed data:", processedData);
        this.updateVis(processedData);
      })
      .catch((error) => {
        console.error("Error loading CSV file:", error);
        console.error("Path attempted:", csvPath);
      });
  }

  /**
   * Render the visualization - update cells, costs, and highlighters
   */
  renderVis() {
    if (!this.polygons) return;

    // Update cell paths
    const cells = this.container
      .select(".cells")
      .selectAll(".cell")
      .data(this.polygons);

    cells
      .enter()
      .append("path")
      .classed("cell", true)
      .merge(cells)
      .attr("filter", "url(#inset-shadow)")
      .attr("d", (d) => `M${d.join(",")}z`)
      .style("fill", (d) => d.site.originalObject.data.originalData.color);

    cells.exit().remove();

    // Update cost labels
    const costs = this.container
      .select(".costs")
      .selectAll(".cost")
      .data(this.polygons);

    costs
      .enter()
      .append("text")
      .classed("cost", true)
      .merge(costs)
      .attr("transform", (d) => `translate(${d.site.x}, ${d.site.y + 6})`)
      .attr("fill", "var(--background-color)")
      .text((d) => d.site.originalObject.data.originalData.cost);

    costs.exit().remove();

    // Update highlighters
    const highlighters = this.container
      .select(".highlighters")
      .selectAll(".highlighter")
      .data(this.polygons);

    highlighters
      .enter()
      .append("path")
      .merge(highlighters)
      .attr(
        "class",
        (d) => `group-${d.site.originalObject.data.originalData.id} highlighter`
      )
      .attr("d", (d) => `M${d.join(",")}z`);

    highlighters.exit().remove();
  }

  /**
   * Setup the container structure for the visualization
   */
  setupContainerStructure() {
    // Draw the circle symbol
    this.drawCircleSymbol();

    // Add total cost text
    this.container
      .append("text")
      .classed("total-cost", true)
      .attr("transform", `rotate(0)translate(0,${-this.radius - 6})`)
      .text("0"); // Will be updated with real value later

    // Create groups for cells, costs, and highlighters
    this.container.append("g").classed("cells", true);
    this.container.append("g").classed("costs", true);
    this.container.append("g").classed("highlighters", true);
  }

  /**
   * Draw the circle symbol
   */
  drawCircleSymbol() {
    const symbol = this.container.append("g").classed("symbol", true);

    symbol.append("circle").attr("r", this.radius - 5);

    symbol
      .append("path")
      .attr("filter", "url(#inset-shadow)")
      .attr("transform", "translate(0,0)")
      .attr("d", ""); // Empty path, just the circle is enough
  }

  /**
   * Compute the circling polygon (boundary)
   * @param {number} radius - The radius of the polygon
   * @return {Array} - Array of points representing the polygon
   */
  computeCirclingPolygon(radius) {
    const points = 60;
    const increment = this._2PI / points;
    const circlingPolygon = [];

    for (let a = 0, i = 0; i < points; i++, a += increment) {
      circlingPolygon.push([radius * Math.cos(a), radius * Math.sin(a)]);
    }

    return circlingPolygon;
  }

  /**
   * Update the legends for the visualization
   * @param {Array} data - The dataset to create legends for
   */
  updateLegends(data) {
    const legendHeight = 13;
    const interLegend = 4;
    const colorWidth = legendHeight * 4;

    // Clear existing legends
    this.legendContainer.selectAll("*").remove();

    // Create new legends
    const reversedData = [...data].reverse();
    const legends = this.legendContainer
      .selectAll(".legend")
      .data(reversedData)
      .enter();

    const legend = legends
      .append("g")
      .classed("legend", true)
      .attr(
        "transform",
        (d, i) => `translate(0, ${-i * (legendHeight + interLegend)})`
      );

    legend
      .append("rect")
      .classed("legend-color", true)
      .attr("filter", "url(#inset-shadow)")
      .attr("y", -legendHeight)
      .attr("width", colorWidth)
      .attr("height", legendHeight)
      .style("fill", (d) => d.color);

    legend
      .append("text")
      .classed("tiny", true)
      .attr("transform", `translate(${colorWidth + 5}, -2)`)
      .text((d) => d.composition)
      .attr("fill", "var(--text-color)");

    legend
      .append("rect")
      .attr("class", (d) => `group-${d.id}`)
      .classed("highlighter", true)
      .attr("y", -legendHeight)
      .attr("width", colorWidth)
      .attr("height", legendHeight);

    // Add title above legends
    this.legendContainer
      .append("text")
      .attr(
        "transform",
        `translate(0, ${-data.length * (legendHeight + interLegend) - 5})`
      )
      .text("Character Distribution")
      .attr("fill", "var(--text-color)");
  }

  /**
   * Create shadow filter definition for SVG
   */
  createShadowFilter() {
    const defs = this.svg.append("defs");

    const filter = defs.append("filter").attr("id", "inset-shadow");

    filter
      .append("feGaussianBlur")
      .attr("stdDeviation", "5")
      .attr("result", "offset-blur");

    filter
      .append("feComposite")
      .attr("operator", "out")
      .attr("in", "SourceGraphic")
      .attr("in2", "offset-blur")
      .attr("result", "inverse");

    filter
      .append("feFlood")
      .attr("flood-color", "grey")
      .attr("flood-opacity", "1")
      .attr("result", "color");

    filter
      .append("feComposite")
      .attr("operator", "in")
      .attr("in", "color")
      .attr("in2", "inverse")
      .attr("result", "shadow");

    const transfer = filter
      .append("feComponentTransfer")
      .attr("in", "shadow")
      .attr("result", "shadow");

    transfer.append("feFuncA").attr("type", "linear").attr("slope", ".75");

    filter
      .append("feComposite")
      .attr("operator", "over")
      .attr("in", "shadow")
      .attr("in2", "SourceGraphic");
  }

  /**
   * Attach mouse listeners for highlighting
   * @param {Array} data - The dataset
   */
  attachMouseListeners(data) {
    data.forEach((d) => {
      const id = d.id;

      d3.selectAll(`.group-${id}`)
        .on("mouseenter", () => this.highlight(id, true))
        .on("mouseleave", () => this.highlight(id, false));
    });
  }

  /**
   * Highlight or unhighlight elements of a group
   * @param {number} groupId - ID of the group to highlight
   * @param {boolean} shouldHighlight - Whether to add or remove highlight
   */
  highlight(groupId, shouldHighlight) {
    d3.selectAll(`.group-${groupId}`).classed("highlight", shouldHighlight);
  }
}
