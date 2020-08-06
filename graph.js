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
const pie = d3.pie()
  .sort(null) // 'null' because we don't want this function to resort our data based on the size of the angles
  .value( d => d.cost); 

// d3.arc() returns an arc generator (string path needed to draw the pie)
const arcPath = d3.arc()
  .outerRadius(dims.radius) 
  .innerRadius(dims.radius/2); 


// ordinal scale: from domain to color
// d3['schemeSet3'] returns an array of different colors that is gonna be the output range for the scale
const color = d3.scaleOrdinal(d3['schemeSet3']);

// legend setup
const legendGroup = svg.append('g')
  .attr('transform' ,`translate(${dims.width + 40}, 10)`); // translate to the right by the width of the graph plus something like 40px and 10px from the top

// legend creation with the use of the 3rd party plugin d3-legend
const legend = d3.legendColor()
  .shape('circle') // each item in the legend will have a circle next to it
  .shapePadding(10) // vertical space between items
  .scale(color); 

const tip = d3.tip() // use of the external library d3-tip
  .attr('class', 'tip card') // card is a materialize css class
  .html(d => {
    let content = `<div class="name">${d.data.name}</div>`;
    content += `<div class="cost">${d.data.cost}</div>`;
    content += `<div class="delete">Click Slice to Delete</div>`;
    return content;
  }); // html determines the html that will be inside the tooltip when shown in the browser

graph.call(tip);


  // update function
const update = data => {

  // update color scale domain
  color.domain(data.map(d => d.name));

  // update and call legend
  legendGroup.call(legend);
  legendGroup.selectAll('text') // select all the text svg inside the group and change its color
    .attr('fill', 'white')
  // pass our data array through pie generator
  // join enhanced (pie) data to paths elements
  const path = graph.selectAll('path')
    .data(pie(data));
  
    
    // handle the exit selection
    path.exit()
    .transition()
    .duration(750)
    .attrTween('d', arcTweenExit)
    .remove();
    
    // handle the current DOM path updates 
    path.attr('d', arcPath)
    .transition()
    .duration(750)
    .attrTween('d', arcTweenUpdate);
    
    path.enter()
    .append('path')
    .attr('class', 'arc')
    .attr('stroke', '#fff')
    .attr('stroke-width', 3)
    .attr('fill', d => color(d.data.name))
    .each(function(d){ this._current = d })
    .transition()
      .duration(750)
      .attrTween('d', arcTweenEnter);
  
    // add events
    graph.selectAll('path')
      .on('mouseover', (d,i,n) => {
        tip.show(d, n[i]) ;// instead of this we use n[i]
        handleMouseOver(d,i,n);
      })
      .on('mouseout', (d,i,n) => {
        tip.hide();
        handleMouseOut(d,i,n);
      })
      .on('click', handleClick)

  };
  
  
  
  // data array and firestore
  var data = [];
  
  db.collection('expenses').onSnapshot(res => {
  // cycling through the changes and for each changes create a doc obj
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

});

// create arcs for the enter selection. We pass in the data, d
const arcTweenEnter = (d) => {
  var i = d3.interpolate(d.endAngle, d.startAngle);
  return function(t) {
    d.startAngle = i(t);
    return arcPath(d)
  }
};

const arcTweenExit = (d) => {
  var i = d3.interpolate(d.startAngle, d.endAngle);
  return function(t){
    d.startAngle = i(t);
    return arcPath(d);
  }
};

// ARC UPDATE TWEEN

function arcTweenUpdate(d){
  // we need to interpolate a value between the two objects, this._current (starting position, current) and d (ending position, new)
  var i = d3.interpolate(this._current, d);
  // update the current prop with new updated data
  this._current = d;
  return function(t) {
    return arcPath(i(t));
  }
}

// event handlers

/**
 * it references automatically the data,d of the specif path, 
 * the i attribute (index of that element in the selection) and 
 * the n attribute (the array of elements in the selection)
 */
const handleMouseOver = (d,i,n) => {
  // console.log(n[i]); // the element which we hover 
  d3.select(n[i]) // d3 wrap the current element so we have access to the d3 methods
    .transition('changeSliceFill') // name the transition so that it can not be interrupted
      .duration(300)
      .attr('fill', '#fff')
}

const handleMouseOut = (d,i,n) => {
  // console.log(n[i]); // the element which we hover 
  d3.select(n[i]) // d3 wrap the current element so we have access to the d3 methods
    .transition('changeSliceFill')
      .duration(300)
      .attr('fill', color(d.data.name))
};

const handleClick = d => {
  // d representts the data attached to the slice we click
  // console.log(d);
  const id = d.data.id;
  // we use the id to query the firsestore database to delete it
  db.collection('expenses').doc(id).delete();
};