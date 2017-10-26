//let dropdown = document.getElementById('dropdown');
//dropdown.addEventListener('change', () => {
////  console.log(dropdown.options[dropdown.selectedIndex].text);
//  let selected = dropdown.options[dropdown.selectedIndex].text;
//  
//  switch(selected) {
//    case 'Recently Added':
//      console.log('Option w/ value of "' + selected + '" has been chosen.');
//      break;
//    case 'Archived':
//      console.log('Option w/ value of "' + selected + '" has been chosen.');
//      break;
//    case 'All':
//      console.log('Option w/ value of "' + selected + '" has been chosen.');
//      break;
//  }
//});

function highlight() {
  // gets recently-added tanzaku
  let recent = document.getElementById('recent');
  
  // gives recent tanzaku the 'base' class (highlighted)
  recent.classList.add('base');
  
  setTimeout(function() {
    // 1/2 a sec. later, adds the 'active' class to begin the transition to
    // the normal table row appearance
    recent.classList.add('active');
  }, 500);
  
  setTimeout(function() {
    // 2 secs. after adding the 'active' class, the 'base' class is removed
    // so any subsequent visits to the page will not highlight that tanzaku
    recent.classList.remove('base');
  }, 2500);
}

document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loader');
  loader.classList.remove('hidden');
  
  // making GET request to the 'all' route of the API
  let xhr = new XMLHttpRequest();
  xhr.addEventListener('load', requestListener);
  xhr.open('GET', '../api/v1/tanzakus');
  xhr.send();
  
  function requestListener() {
    let data = this.responseText;
    let response = JSON.parse(data);
    
    // Error handling of bad database connection
    if (response.error) {
      let errorTitle = 'Something went wrong! &#128557;';
      let errorMessage = "Error connecting to the database. Please try again later. If the issue persists, ensure you can make a manual connection to the database to verify whether or not it is a database issue.";
      
      loader.classList.add('hidden');
      createModal(errorTitle, errorMessage, false);
      return;
    }
    
    let size = Object.keys(response).length;

    for (let i = size - 1; i >= 0; i--) {
      let id =          response[i].id;
      let url =         response[i].url;
      let title =       response[i].title;
      let desc =        response[i].description;
      let created_at =  response[i].created_at;
      
      if (!id)
        id = '0101010';

      if (desc === 'undefined')
        desc = title;
      
      createCard(title, url, desc, created_at, id);
    }
    
    loader.classList.add('hidden');
    
    let deleteBtns = document.getElementsByClassName('_delete');
    for (var i = 0; i < deleteBtns.length; i++)
      deleteBtns[i].addEventListener('click', deleteTanzaku);
    
    // if (window.location.href.endsWith('recent'))
    //  highlight();
  }
});

function deleteTanzaku() {
  let id = this.getAttribute('data-id');
  
  // confirm deletion of tanzaku
  let deleteTitle = 'Finished with this tanzaku?';
  let deleteMessage = 'Are you sure you want to delete this tanzaku?';
  
  createModal(deleteTitle, deleteMessage, true, id);
}

function continueDeletion(should_delete, id) {
  let apiDeleteUrl = '../api/v1/tanzakus/' + id;
  
  if (should_delete) {
    let xhr = new XMLHttpRequest();
    xhr.addEventListener('load', requestListener);
    xhr.open('DELETE', apiDeleteUrl);
    xhr.send();
  } else
    return;
  
  function requestListener() {
    window.location.href = '/all/tanzakus.html';
  }
}


function convertUTC(date) {
  let dateTime = new Date(date);
  let locale = 'en-US';
  
  let formatOptions = {
    day:    '2-digit', 
    month:  '2-digit', 
    year:   'numeric',
    hour:   '2-digit', 
    minute: '2-digit',
    hour12: true
  };
  let dateTimeString = dateTime.toLocaleDateString(locale, formatOptions);

  dateTimeString = dateTimeString.replace(',', '');
  
  let MMDDYYYY = dateTimeString.substr(0, 10),
      formattedDate = '';
  let time = dateTimeString.substr(11);

  let objDate = new Date(MMDDYYYY),
      mon = objDate.toLocaleString(locale, {month: 'short'}),
      dd = MMDDYYYY.substr(3, 2),
      yyyy = MMDDYYYY.substr(6, 4);
  
  formattedDate = time + ' - ' + dd + ' ' + mon + ' ' + yyyy;

  return formattedDate;
}


function createCard(title, url, desc, created_at, id) {
  const cardDiv = document.getElementById('card-div');
  let rootUrl = '';
  
  let formattedTime = convertUTC(created_at);
  
  if (url.length > 52)
    rootUrl = url.substr(0, 50) + '...';
  else
    rootUrl = url;
  
  let card = document.createElement('div');
  card.classList.add('card');
  card.innerHTML = '<div class="card"><header class="card-header"><a href="' + url + '" class="card-header-icon"><span class="icon">🎋</span></a><p class="card-header-title">' + title + '</p></header><div class="card-content"><div class="content"><p>' + desc + '</p><small> <a href="' + url + '" target="_blank">' + rootUrl + '</a> </small> <small> <a class="timestamp">' + formattedTime + '</a> </small></div></div><footer class="card-footer"><a href="' + url + '" target="_blank" class="card-footer-item">View</a><a data-id="' + id + '"class="card-footer-item _delete">Delete</a></footer></div>';
  
  cardDiv.appendChild(card);
}


function fillTable(title, url, recent) {
  const table = document.getElementById('table');
  let row = table.insertRow(1);
  
  if (recent === true)
    row.setAttribute('id', 'recent');
  
  let cellTitle = row.insertCell(0);
  let cellUrl = row.insertCell(1);
  
  let anchor = document.createElement('a');
  anchor.setAttribute('href', url);
  anchor.innerHTML = url;
  
  cellTitle.innerHTML = title;
  cellUrl.appendChild(anchor);
}