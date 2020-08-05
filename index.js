const form = document.querySelector('form');
const name = document.querySelector('#name');
const cost = document.querySelector('#cost');
const error = document.querySelector('#error');

form.addEventListener('submit', (event)=>{
  event.preventDefault();
  // check if user has inputed something in name and cost fields, otherwise error
  if (name.value && cost.value) {
    // create a new object that represent the document we save to the firestore database
    const item = {
      name: name.value,
      cost: parseInt(cost.value)
    };

    // submit the item to our expenses collection saving it as a document
    // this operation takes time. It is an asynchronous operation and return a Promise
    // so we can chain a .then() method that fires a callback function when 
    // the action of adding the document is completed
    // .then() takes a parameter that is the response (res) from the firestore database
    db.collection('expenses')
      .add(item)
      .then(res => {
        // reset the input fields to empty again (we could have used 'reset form' too)
        name.value = "";
        cost.value = "";
        error.textContent = "";
    })
  } else {
    error.textContent = "Please enter both values before submitting!";
  }
})