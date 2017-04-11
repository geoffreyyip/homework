// holds data on family members
var household = [];

// DOM nodes
var addButton = document.querySelector('.add');
var submitButton = document.querySelector('button[type="submit"]');
var ageField = document.querySelector('input[name="age"]');
var relationshipField = document.querySelector('select[name="rel"]');
var smokerCheckbox = document.querySelector('input[name="smoker"]');
var householdList = document.querySelector('.household');
var debugLog = document.querySelector('.debug');

/*******************
 * Form Validation
 *******************/

var isValidAge = function isValidAge() {
  var age = ageField.value;

  // reject when age field is blank, a non-number value, or a non-positive number
  if (age === '') {
    alert('Age field must contain a value');
    return false
  } else if (isNaN(age)) {
    alert('Age must be a positive number');
    return false;
  } else if (Number(age) <= 0) {
    alert('Age must be a positive number');
    return false;
  }

  return true;
}

var isValidRelationship = function isValidRelationship() {
  var relationship = relationshipField.value;

  // reject when no dropdown choice has been selected
  if (relationship === "") {
    alert('A relationship must be chosen');
    return false;
  }

  return true;
}

/***********************
 * Add Button Behavior
 ***********************/

var resetFields = function resetFields() {
  ageField.value = "";
  relationshipField.value = "";
  smokerCheckbox.checked = false;
}

var addMember = function addMember() {
  // block on invalid input
  if (!isValidAge() || !isValidRelationship()) {
    return false;
  }

  // push new member to household state
  var member = {};
  member.age = ageField.value;
  member.relationship = relationshipField.value;
  member.isSmoker = smokerCheckbox.checked;

  household.push(member);

  // reset input fields and re-render household state
  resetFields();
  displayMembers(household);
}

/*
 * <button> tags default to <button type="submit">
 *
 * this causes the addButton to automatically send a GET request to the page
 * defined in the surrounding <form> tag. No page is defined in index.html's <form>
 * so the default behavior is to reload the existing page with query values
 * taken from the <input> tags
 *
 * this behavior is undesirable. we set <button> to <button type="button"> to
 * supress the default behavior and allow for client-side scripting.
 */
addButton.type = 'button';
addButton.addEventListener('click', addMember);

/**************************
 * Submit Button Behavior
 **************************/

var sendToFakeServer = function sendToFakeServer() {
  var data = JSON.stringify(household);
  debugLog.innerHTML = data;
}

/**
 * we're not actually making a POST request, so <button type="submit">
 * is replaced with <button type="button">
 */
submitButton.type = 'button';
submitButton.addEventListener('click', sendToFakeServer);

/***************************
 * Render Household List
 ***************************/

// helper method
var deleteItem = function deleteItem(arr, index) {
  /*
   * mark an index for deletion, combine the array of items before it with
   * the array of items after it
   */
  var before = arr.slice(0, index);
  var after = arr.slice(index + 1);

  return before.concat(after);
}

var displayMembers = function displayMembers(members) {
  var result = document.createDocumentFragment();

  // each list item will contain a textual description and a delete button
  members.forEach(function(member, index) {
    var age = 'Age: ' + member.age;
    var rel = 'Relationship: ' + member.relationship;
    var smoker = 'Smoker: ' + member.isSmoker;

    // join on <br> to place values on separate lines
    var description = document.createElement('p');
    description.innerHTML = [age, rel, smoker].join('<br>');

    // attach itemIds to each item so event listeners know which element to delete
    var deleteButton = document.createElement('button');
    deleteButton.setAttribute('type', 'button');
    deleteButton.textContent = 'Delete';
    deleteButton.dataset.itemId = index;

    var listItem = document.createElement('li');
    listItem.appendChild(description);
    listItem.appendChild(deleteButton);

    result.appendChild(listItem);
  });

  // replace old view with new view
  householdList.innerHTML = '';
  householdList.appendChild(result);
}

// attach delete handler to householdList container
householdList.addEventListener('click', function(event) {
  var itemId = Number(event.target.dataset.itemId);
  household = deleteItem(household, itemId);
  displayMembers(household);
});
