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