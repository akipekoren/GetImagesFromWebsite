// ***************************************************************//
//   EidosMedia Exercise                                          //
//   Author : Ahmet Kaan Ipekoren                                 //
//   Date : 07.11.2021                                            //
// ***************************************************************//

let pageUrl = "https://www.corriere.it/"; // target url link
let delay = 400; // delay for printing images one by one
let isPrinted = false; // simply boolean function to check is there any image on the page or not

const getHTMLOfThePage = async (url) => {
  /*
  Fetch the given url
  Return html page of the url
  In error, log to console
  */

  return fetch(url)
    .then((res) => {
      return res.text();
    })
    .catch(() => {
      console.log("Something wrong!");
    });
};

function isNumberKey(evt) {
  /*
  Be sure that only numbers entered in the input field
  */
  var charCode = evt.which ? evt.which : evt.keyCode;
  if (charCode < 48 || charCode > 57) return false;
  document.getElementById("printButton").disabled = false;
  return true;
}

function getImageUrlsFromPage(pageContent) {
  /*
  From all the html code, split it and get only tags with <img
  */

  let lines = pageContent.split("\n"); // split all html page one by one
  let imgRegex = /<img([\w\W]+?)\/>/;
  let imageUrlRegex = /src="([\w\W]+?)"/;
  let imageDataUrlRegex = /data-src="([\w\W]+?)"/;
  let imageList = [];

  lines.forEach((line) => {
    if (imgRegex.test(line)) {
      let res = imgRegex.exec(line);
      let imageTag = res[0];
      let imageUrl = "";
      if (imageDataUrlRegex.test(imageTag)) {
        imageUrl = imageDataUrlRegex.exec(imageTag)[1];
      } else {
        imageUrl = imageUrlRegex.exec(imageTag)[1];
      }

      if (imageUrl.startsWith("http")) {
        imageList.push(imageUrl);
      }
    }
  });

  return imageList;
}

function printUrlandImage(url) {
  /*
  Create li and img items
  Print to index.html page
  */
  var img = document.createElement("img");
  img.src = url;
  img.style.width = "200px";
  img.style.height = "200px";
  document.getElementById("myList").appendChild(img);
  var node = document.createElement("li");
  var textnode = document.createTextNode(url);
  node.appendChild(textnode);
  document.getElementById("myList").appendChild(node);
}

async function retrieveImages() {
  /*
  Firstly retrive input value (number of images to print screen) and conver to int
  Get only image urls from the given html page
  Start the progress bar
  Loop over all the image urls
  */

  if (!isPrinted) {
    let str = document.getElementById("imageCounter").value; // retrieve input
    imageCounter = parseInt(str); // conver to int
    document.getElementById("imageCounter").value = ""; //delete input field after submission
    document.getElementById("printButton").disabled = true;

    let pageContent = await getHTMLOfThePage(pageUrl);
    let imagesUrls = getImageUrlsFromPage(pageContent); // get only image urls in the html page

    let bar = addProgress();
    loader(bar, delay * imageCounter);

    let i = 0;
    function myLoop() {
      setTimeout(function () {
        printUrlandImage(imagesUrls[i]);
        i++; //  increment the counter
        if (i < imageCounter) {
          myLoop(); // call the loop until reaching the value
        }
      }, delay);
    }
    myLoop();
    isPrinted = true;
  } else {
    refreshImages();
    retrieveImages();
  }
}

async function refreshImages() {
  /*
    Clear page
  */
  let myList = document.getElementById("myList");
  let progressBar = document.getElementById("container-progress");
  myList.innerHTML = ""; // make mylist empty
  progressBar.innerHTML = "";
  isPrinted = false;
}

function loader(element, time) {
  /*
  Load the progress bar
  In every (time/element.max) ms, progress bar value increases by 1 
  */
  function tick() {
    element.value = parseInt(element.value) + 1;
    if (element.value == element.max) {
      clearInterval(timer);
    }
  }
  let timer = setInterval(tick, time / element.max);
}

function addProgress() {
  /*
  Show the hidden progress bar
  */
  let template = document.querySelector("template");
  let progress = document.importNode(template.content, true);
  let container = document.querySelector(".container-progress");
  container.appendChild(progress);
  return container.querySelector("progress:last-child");
}
