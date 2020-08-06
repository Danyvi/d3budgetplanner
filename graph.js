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
  .attr('height', dims.height + 150); // extra space at the bottom if we need it

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
/* const angles = pie([
  {name:'rent', cost:500},
  {name:'bills', cost:300},
  {name:'gaming', cost:200}
]); */

// console.log(angles);

// the arc generator generates the path string (that has a property called 'd' that is the path string) that we need to draw the pie chart
// the arc path generator need the start and end angle
// the arcPath is a slice path
// d3.arc() returns an arc generator
const arcPath = d3.arc()
  .outerRadius(dims.radius) // outer radius of the arcs, from the center
  .innerRadius(dims.radius/2); // inner radius from where the arc start

// console.log(arcPath(angles[0])); // generate the d string that represent the path

// ordinal scale: from domain to color
// d3['schemeSet3'] returns an array of different colors that is gonna be the output range for the scale
const color = d3.scaleOrdinal(d3['schemeSet3']);

// update function
const update = data => {

  // update color scale domain
  color.domain(data.map(d => d.name));

  // pass our data array through pie generator
  // this spits out a new array of data where I can find the angles with the original data
  // join enhanced (pie) data to paths elements
  const path = graph.selectAll('path')
    .data(pie(data));
  
  // console.log the enter selection
  // console.log(path.enter());

  path.enter()
  .append('path')
  .attr('class', 'arc')
  .attr('d', arcPath)
  .attr('stroke', '#fff')
  .attr('stroke-width', 3)
  .attr('fill', d => color(d.data.name));

  // handle the exit selection
  path.exit()
    .remove();

  // handle the current DOM path updates (d attribute of the path)
  // we want d3 to redraw the path arcPath function
  // this automatically passes to the path the newest data to the current path in the DOM and redrawn the things
  path.attr('d', arcPath);
  
};

// data array and firectore
var data = [];

db.collection('expenses').onSnapshot(res => {
  // cycling through the changes and for each changes create a doc obj
  // this doc obj will contain the data of that document of that change,
  // plus an extra id property that is the random generated id associated with that doc
  res.docChanges().forEach(change=>{
    const doc = {...change.doc.data(), id: change.doc.id };

    switch (change.type) {
      case 'added':
        data.push(doc);
        break;
      case 'modified':
        const index = data.findIndex(item=>item.id == doc.id);
        data[index] = doc;
        break;
      case 'removed':
        data = data.filter(item=>item.id !== doc.id);
        break;
      default:
        break;
    }
  });

  update(data);
})