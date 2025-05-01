# Data Visualization

# Group 13:

## Project 3: Big Bang Theory Characters Visualization

### Team Member:

- Nhat Nguyen
- Long Nguyen
- Du Nguyen

### Code Base Structure

- `css` folder: stores all the styling files
- `data` folder: stores .csv files
- `images` folder: stores any images used on the page
- `js` folder: stores all the bts `js` code
- `documentation` folder: stores any documentation resources

## Motivation
The motivation behind this application is to explore the evolving character dynamics and thematic focus in The Big Bang Theory, particularly through the lens of Sheldon Cooper’s dialogues. As one of the most iconic and complex characters, Sheldon’s interactions reflect much of the show's humor, tension, and emotional growth.

By using topic modeling and structured dialogue analysis across seasons and characters, this application seeks to quantify and visualize:

How Sheldon’s conversational focus changes over time

Which characters he discusses certain topics with

Recurring themes like roommate disputes, scientific debates, romantic struggles, and social misunderstandings

### What This Enables Someone to Understand
#### Character Development
Track how Sheldon’s priorities shift — from rigid routines and roommate conflicts in early seasons to more emotional and romantic topics in later ones (especially involving Amy).

#### Relationship Dynamics
Understand the nature of Sheldon’s interactions with other characters (e.g., constant negotiation with Leonard, evolving romance with Amy, cultural clashes with Penny).

#### Show Structure & Themes
Reveal how certain running jokes, nerd culture references, and scientific discussions are distributed across seasons and characters.

## Data

**Dataset**: 
- [Here](data/raw/big_bang_scripts.csv) is our raw dataset.
- [Here](data/counted) is our scraped data, where we got the line counts.
- [Here](data/voronoi_data) is the data for the voronoi tree map.

**Source**: https://bigbangtrans.wordpress.com

**Important Fields in our data**:
- Episode (Season _ Episode __: Episode Name).
- Dialogue
- Speaker
- Dialogue count

A lot of charts were included in the webpage, and we needed to process a lot of data here. Here we will lay out how we processed it exactly:

1. Collecting raw data.
2. Split into separate seasons for easier parsing.
3. Tallied up total number of dialogues of each character found in the season.
4. Parsed through the dialogue, eliminating words like "I", "and", "or"... to generate word cloud.
5. Kept characters' scores between each other. If they have 2 lines of dialogue right next to each other, directed at each other then that score goes up for the chord chart.


## Visualization Components and Justification
### Show Introduction
A very simple blurb of text that introduces the show, its significance and the main cast. 

- Justification: We figured the best way to get these information out is just by text, and let the rest of our visualizations show more information.

### Stacked Chart
This stacked chart will show the running tally of the lines each of the main cast had throughout the show. This chart can also be changed to show each season in more detail.

![Stacked Chart](image-2.png)

- Justification: using a stacked chart like this will help the viewers find certain trends throughout the show.

### Voronoi Tree Map
This chart is a fun way to look at the number of lines each character has!

- Justification: Though this practically shows the same information as the previous chart, we believe that this will offer a more complete look at the entire cast and compare their presences on the show against each other.
![Voronoi](image-4.png)

### Word Cloud
This shows each of the main character's favorite unique words. Again, viewers can pick between the whole season or viewing each season by themselves to see if the vocabulary changes.
- Justification: we figured that the simplest and most elegant way to show this would just be a simple bubble chart, but allowing for some movement to make it more fun to look at.
![alt text](image-5.png) 

### Chord Chart
The Chord diagram visualizes the interactions between characters in the show. Each character is represented by a colored arc, and the connections between them indicate the frequency of their dialogues. The thickness of the lines represents the strength of their interactions, providing insights into the dynamics of their relationships throughout the series.
- Justification: after some thinking, we went with the chord chart since it was simple and effective in showing this type of relational data we wanted to show.
![image](https://github.com/user-attachments/assets/b5899bde-20be-4afe-a176-04651f37399f)

### Bar Chart to show the most mentioned topics in the show between characters
The Bar chart visualizes the topics of interest that Sheldon Cooper, one of the main characters, frequently discusses. Each bar represents a specific topic, and its length indicates the number of times Sheldon mentions it throughout the series. This chart provides insights into Sheldon's character and his intellectual pursuits, showcasing the themes that resonate most with him.
- Justification: We wonder if bar chart or line chart will show the changes in topics between seasons. However, we come to the conclusion that bar chart is better in showing the dominance in a topic comparing to the others between Sheldon and other characters. We also include 2 select options to toggle between seasons and characters.
![image](https://github.com/user-attachments/assets/81f1073c-fa1b-4cae-87c1-7c5ebbd778cb)



## Key Findings
- Looking at the stacked chart we can see that whenever a new main character (Amy and Bernadette) debuts there will certainly be a drop in total number of lines for each character! We are faily sure these changes are made to fit all characters within the set time frame for each episode.
![Stacked Chart](image-2.png)

- The cast love each other! Looking at our word cloud, we can see that most of the most said words from each character is the name of another character (or themselves). How sweet!
![alt text](image-6.png)

- We can see the word 'know' being used a lot among characters. This totally makes sense, since this is a humor-scientific show. "I know" or "Do you know ... " have been used a lot ! How interesting it is!
- we can also see a deeper connection is formed between Sheldon and Leonard with a large number of dialogues between them comparing to other relationship in the show. This is actually true when Sheldon and Leonards are best friends in the show.

## Technicality
The entirety of our code can be found right here in this repo (https://github.com/huuquangnhatnguyen/DataVisualizationProject3)
The live demo can be found here ![](https://data-visualization-project3.vercel.app/)
We used Beauty4Soup for web scraping to get the scripts.
We used D3 for drawing most of the visualizations: Stacked Area Chart, Voronoi Chart, Chord Diagram, Bar Chart, Bubble Chart 
We used Pandas, Pytorch and Scala for data processing.

### Sketches
First Draft...
![First Sketch](image.png)

More detailed
![Detailed](image-1.png)

Level 1:
- A little intro header with tabs that introduce each main character
- We really liked the idea of a voronoi map and wanted to include it somewhere in our page, so we incorporated 2 views of showing the number of lines for each character. One is a stacked bar chart, better for seeing the season-to-season changes, and one as a voronoi, better to compare one character against another.

Levels 2 and 3:
- For the word cloud, we went with a bubble chart showing each character's most common word found in their script.
- Since the word cloud already used a bubble view, we went with a chord chart to show the relationship between characters, which we found by making a script that would find dialogues between characters in the same scenes.

Level 4: 
- We went with finding what Penny and Sheldon were discussing most in the show. Since they have a lot of presence together, it'd be interesting to see what they have to say.


## Demo Video
https://youtu.be/-hE2pWrIHNU?si=1xt2JKjG2DxfBNxk

### Work Distribution
We split up the work like so: each person handles a little bit of each level, trying to find things that will help each other progress and slowly get to level 4.

#### Nhat Nguyen:
- Implementing Stacked Chart.
- Process Data for Chord Chart.
- Implementing Voronoi Chart
- Implementing Bar Chart for Sheldon's topics
- Debugging.

#### Du Nguyen:
- Collected and processed most of the data.
- Main designer.
- Implemented the Voronoi chart and the word cloud.

#### Jack Nguyen
- Documenting.
- Setting up color scheme, app layout and sketching ideas.
- Implemented the Chord Chart.
- Debugging.
  
