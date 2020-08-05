// dimensions of our chart
const dims = {
  height: 300,
  width: 300,
  radius: 150
};

// center (x,y coordinates that determine the center of our chart)
const cent = {
  x: (dims.width / 2 + 5), // add 5 from the center for extra space around the edges
  y: (dims.height / 2 + 5)
};

// create the svg container
const svg = d3.select('.canvas')
  .append('svg')
  .attr('width', dims.width + 150) // extra amount of space on the right for the legend
  .attr('height', dims.height + 150) // extra space at the bottom if we need it

// create a group that contains all our graph elements and appending to the svg
const graph = svg.append('g')
  .attr('transform', `translate(${cent.x}, ${cent.y})`); // translate across to the center of the svg container

// pie generator (it generates the angles for the slices in the pie chart)
// .pie() returns a function that generates angles based on the cost property of the data
// so const pie wil be a function
const pie = d3.pie()
  .sort(null) // 'null' because we don't want this function to resort our data based on the size of the angles
  .value( d => d.cost); // function that takes the data object 'd'that returns which data we want to evaluate

// create dummy data to test, using the const 'pie' above that is a function
// return angles that sum to 2PI
const angles = pie([
  {name:'rent', cost:500},
  {name:'bills', cost:300},
  {name:'gaming', cost:200}
]);

console.log(angles);