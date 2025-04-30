class BubbleChart {
  /**
   * Class constructor with basic chart configuration
   * @param {Object} _config - Configuration object
   * @param {Array} _data - Data array
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 800,
      containerHeight: _config.containerHeight || 500,
      margin: _config.margin || { top: 40, right: 20, bottom: 30, left: 40 },
      tooltipPadding: _config.tooltipPadding || 15,
      simulationDuration: _config.simulationDuration || 1000, // Duration for simulation in ms
    };
    this.data = _data || [];
    this.labelsVisible = false; // Track label visibility state
    this.initVis();
  }

  /**
   * Initialize the visualization
   */
  initVis() {
    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width =
      vis.config.containerWidth -
      vis.config.margin.left -
      vis.config.margin.right;
    vis.height =
      vis.config.containerHeight -
      vis.config.margin.top -
      vis.config.margin.bottom;

    // Initialize SVG
    vis.svg = d3
      .select(vis.config.parentElement)
      .append("svg")
      .attr("width", vis.config.containerWidth)
      .attr("height", vis.config.containerHeight)
      .attr("class", "bubble-chart");

    // Append group element that will contain our actual chart
    vis.chart = vis.svg
      .append("g")
      .attr(
        "transform",
        `translate(${vis.config.margin.left},${vis.config.margin.top})`
      );

    // Initialize color scale for main characters
    vis.colorScale = d3
      .scaleOrdinal()
      .domain([
        "Sheldon",
        "Leonard",
        "Penny",
        "Howard",
        "Bernadette",
        "Raj",
        "Amy",
      ])
      .range([
        "#FF6B6B",
        "#4DABF7",
        "#69DB7C",
        "#B197FC",
        "#FFA94D",
        "#FFD43B",
        "#38D9A9",
      ]);

    // Initialize force simulation with weaker initial forces
    vis.simulation = d3
      .forceSimulation()
      .force("center", d3.forceCenter(vis.width / 2, vis.height / 2))
      .force("charge", d3.forceManyBody().strength(5))
      .force(
        "collide",
        d3
          .forceCollide()
          .radius((d) => d.radius + 1)
          .iterations(2)
      );

    // Initialize tooltip
    vis.tooltip = d3.select("#tooltip");

    // Set up scales
    vis.radiusScale = d3.scaleSqrt().range([5, 50]);

    this.updateVis();
  }

  /**
   * Prepare the data and scales before rendering
   */
  updateVis() {
    let vis = this;

    // Reset labels visibility state when updating with new data
    vis.labelsVisible = false;

    if (!vis.data || vis.data.length === 0) {
      console.warn("No data available");
      return;
    }

    // Generate a unique ID for data items that don't have one
    let nodeId = 0;

    // Create a hierarchical structure for the bubble chart
    const nodes = vis.data.map((d, i) => {
      // Generate a unique ID if none exists
      const id = d.id ? d.id : `node-${i}-${nodeId++}`;

      return {
        id: id,
        character: d.character,
        season: d.season,
        word: d.word,
        count: +d.count,
        uniquenessScore: d.uniqueness_score ? +d.uniqueness_score : null,
        radius: 0, // Will be calculated based on count
      };
    });

    // Update the radius scale domain
    const countExtent = d3.extent(nodes, (d) => d.count);
    if (countExtent[0] !== undefined && countExtent[1] !== undefined) {
      vis.radiusScale.domain(countExtent);
    }

    // Update radius for each node
    nodes.forEach((d) => {
      d.radius = vis.radiusScale(d.count);
    });

    // Group nodes by character
    const characterGroups = d3.group(nodes, (d) => d.character);

    // Find the largest bubble for each character
    const largestBubbles = new Map();
    characterGroups.forEach((bubbles, character) => {
      if (bubbles && bubbles.length > 0) {
        const largest = bubbles.reduce(
          (max, b) => (b.count > max.count ? b : max),
          bubbles[0]
        );
        largestBubbles.set(character, largest);
      }
    });

    // Calculate center positions for each character group
    // Position them in a much more compact circular layout
    const numCharacters = characterGroups.size;

    // MODIFIED: Further reduced radius to 25% of the smaller dimension (was 35%)
    // This brings character groups much closer to the center
    const radius = Math.min(vis.width, vis.height) * 0.25;
    const characterCenters = new Map();

    // MODIFIED: Adjust positioning for more even distribution
    let i = 0;
    characterGroups.forEach((bubbles, character) => {
      // Start angle from -π/2 (top) to distribute more evenly
      const angle = -Math.PI / 2 + (i / numCharacters) * 2 * Math.PI;
      characterCenters.set(character, {
        x: vis.width / 2 + radius * Math.cos(angle),
        y: vis.height / 2 + radius * Math.sin(angle),
      });
      i++;
    });

    // MODIFIED: Further increased force strength for tighter grouping (was 0.3)
    // Custom force to position nodes around their character centers
    vis.simulation.force(
      "x",
      d3
        .forceX()
        .strength(0.4)
        .x((d) => {
          const center = characterCenters.get(d.character);
          return center ? center.x : vis.width / 2;
        })
    );

    vis.simulation.force(
      "y",
      d3
        .forceY()
        .strength(0.4)
        .y((d) => {
          const center = characterCenters.get(d.character);
          return center ? center.y : vis.height / 2;
        })
    );

    // ADDED: Containment force to prevent bubbles from going outside the visible area
    vis.simulation.force("containment", (alphaDecay) => {
      for (let node of nodes) {
        // Add padding equal to the node's radius
        const padding = node.radius;

        // Left boundary
        if (node.x - padding < 0) {
          node.vx += (padding - node.x) * alphaDecay * 0.5;
        }
        // Right boundary
        if (node.x + padding > vis.width) {
          node.vx -= (node.x + padding - vis.width) * alphaDecay * 0.5;
        }
        // Top boundary
        if (node.y - padding < 0) {
          node.vy += (padding - node.y) * alphaDecay * 0.5;
        }
        // Bottom boundary
        if (node.y + padding > vis.height) {
          node.vy -= (node.y + padding - vis.height) * alphaDecay * 0.5;
        }
      }
    });

    // Custom force to ensure largest bubbles stay more centered in their groups
    vis.simulation.force("largest-centered", (alphaDecay) => {
      for (let node of nodes) {
        const largest = largestBubbles.get(node.character);
        if (largest && node.id === largest.id) {
          // Apply stronger force to keep largest bubbles centered
          const center = characterCenters.get(node.character);
          if (center) {
            // MODIFIED: Increased force strength for better centering (was 0.5)
            node.vx = (center.x - node.x) * alphaDecay * 0.8;
            node.vy = (center.y - node.y) * alphaDecay * 0.8;
          }
        }
      }
    });

    // MODIFIED: Adjusted collision force for tighter packing
    vis.simulation
      .nodes(nodes)
      .force(
        "collide",
        d3
          .forceCollide()
          .radius((d) => d.radius + 0.5)
          .iterations(4)
      )
      .on("tick", () => {
        vis.renderVis();
      })
      .on("end", () => {
        // Show labels when simulation has settled
        setTimeout(() => {
          vis.labelsVisible = true;
          vis.renderVis();
        }, 100); // Small delay to ensure bubbles are fully settled
      });

    // ADDED: Center attraction force to pull everything toward center
    vis.simulation.force(
      "center-attraction",
      d3.forceRadial(0, vis.width / 2, vis.height / 2).strength(0.01)
    );

    // MODIFIED: Increase alpha decay rate for faster stabilization
    vis.simulation.alphaDecay(0.015);

    // Restart the simulation
    vis.simulation.alpha(1).restart();

    vis.nodes = nodes;
    vis.largestBubbles = largestBubbles;
    vis.renderVis();

    // Create legend
    this.createLegend();
  }

  /**
   * Bind data to visual elements
   */
  renderVis() {
    let vis = this;

    // Bind data to circles
    const bubbles = vis.chart.selectAll(".bubble").data(vis.nodes, (d) => d.id);

    // Remove old circles
    bubbles.exit().remove();

    // Enter new circles
    const bubblesEnter = bubbles
      .enter()
      .append("circle")
      .attr("class", (d) => {
        // Add special class for largest bubbles
        const largest = vis.largestBubbles.get(d.character);
        return `bubble ${
          largest && d.id === largest.id ? "largest-bubble" : ""
        }`;
      })
      .attr("r", (d) => d.radius)
      .attr("fill", (d) => vis.colorScale(d.character))
      .attr("stroke", (d) => {
        // Give largest bubbles a more prominent stroke
        const largest = vis.largestBubbles.get(d.character);
        return largest && d.id === largest.id ? "#333" : "white";
      })
      .attr("stroke-width", (d) => {
        // Give largest bubbles a more prominent stroke
        const largest = vis.largestBubbles.get(d.character);
        return largest && d.id === largest.id ? 2 : 1;
      })
      .on("mouseover", function (event, d) {
        d3.select(this).attr("stroke-width", 2).attr("stroke", "#333");

        // Build tooltip content based on available data
        let tooltipContent = `
            <div class="tooltip-title">${d.character}: "${d.word}"</div>
            <div><i>Count: ${d.count}</i></div>
          `;

        // Add season information if available
        if (d.season) {
          tooltipContent += `<div><i>Season: ${d.season}</i></div>`;
        }

        // Add uniqueness score if available
        if (d.uniquenessScore !== null) {
          const formattedScore = d.uniquenessScore.toFixed(2);
          tooltipContent += `<div><i>Uniqueness Score: ${formattedScore}</i></div>`;
        }

        vis.tooltip
          .style("opacity", 1)
          .style("left", event.pageX + vis.config.tooltipPadding + "px")
          .style("top", event.pageY + vis.config.tooltipPadding + "px")
          .html(tooltipContent);
      })
      .on("mousemove", function (event) {
        vis.tooltip
          .style("left", event.pageX + vis.config.tooltipPadding + "px")
          .style("top", event.pageY + vis.config.tooltipPadding + "px");
      })
      .on("mouseleave", function (event, d) {
        // Restore stroke style based on whether it's a largest bubble
        const largest = vis.largestBubbles.get(d.character);
        d3.select(this)
          .attr("stroke-width", largest && d.id === largest.id ? 2 : 1)
          .attr("stroke", largest && d.id === largest.id ? "#333" : "white");

        vis.tooltip.style("opacity", 0);
      });

    // Update the position of all circles
    vis.chart
      .selectAll(".bubble")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y);

    // Bind data to text labels
    const labels = vis.chart
      .selectAll(".bubble-label")
      .data(vis.nodes, (d) => d.id);

    // Remove old labels
    labels.exit().remove();

    // Enter new labels
    const labelsEnter = labels
      .enter()
      .append("text")
      .attr("class", "bubble-label")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "#ffffff") // White text color
      .attr("pointer-events", "none") // Avoid interfering with bubble mouse events
      .style("font-size", (d) => {
        // Scale font size based on bubble radius
        // Make sure font size is reasonable (not too small or too big)
        const fontSize = Math.max(8, Math.min(d.radius * 0.8, 14));
        return `${fontSize}px`;
      })
      .style("font-family", "Abel, sans-serif")
      .style("font-weight", (d) => {
        // Make largest bubbles' text bold
        const largest = vis.largestBubbles.get(d.character);
        return largest && d.id === largest.id ? "bold" : "normal";
      })
      .style("opacity", 0) // Start with invisible labels
      .text((d) => d.word);

    // Update positions of all labels
    vis.chart
      .selectAll(".bubble-label")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .style("font-size", (d) => {
        // Update font size dynamically
        const fontSize = Math.max(8, Math.min(d.radius * 0.8, 14));
        return `${fontSize}px`;
      })
      .style("opacity", (d) => {
        // Only show labels if simulation has settled and bubble is large enough
        return vis.labelsVisible && d.radius >= 10 ? 1 : 0;
      })
      .style("transition", "opacity 0.5s ease-in"); // Add smooth fade-in transition
  }

  /**
   * Create a legend for the bubble chart
   */
  createLegend() {
    let vis = this;

    // Clear any existing legend
    d3.select(".bubble-legend").html("");

    // Get unique characters
    const characters = [...new Set(vis.data.map((d) => d.character))];

    // Create legend items
    const legendItems = d3
      .select(".bubble-legend")
      .selectAll(".legend-item")
      .data(characters)
      .enter()
      .append("div")
      .attr("class", "legend-item");

    // Add color square
    legendItems
      .append("div")
      .attr("class", "legend-color")
      .style("background-color", (d) => vis.colorScale(d));

    // Add label
    legendItems
      .append("div")
      .attr("class", "legend-label")
      .text((d) => d);
  }

  /**
   * Update the visualization with new data
   */
  updateData(newData) {
    this.data = newData || [];
    this.updateVis();
  }
}
