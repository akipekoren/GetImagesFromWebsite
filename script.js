var pageUrl = "https://www.corriere.it/"; // target url link
var delay = 400;
var isPrinted = false;
let promise = Promise.resolve();
let container = document.querySelector(".containerProgress");
let template = document.querySelector("template");

const getHTMLOfThePage = async (url) => {
  return fetch(url)
    .then((res) => {
      return res.text();
    })
    .catch(() => {
      console.log("Something wrong!");
    });
};

function isNumberKey(evt) {
  var charCode = evt.which ? evt.which : evt.keyCode;
  if (charCode > 31 && charCode != 46 && (charCode < 48 || charCode > 57))
    return false;
  document.getElementById("printButton").disabled = false;
  return true;
}

function getImageUrlsFromPage(pageContent) {
  var imgRegex = /<img([\w\W]+?)\/>/;
  var lines = pageContent.split("\n"); // split all html page one by one
  var imageUrlRegex = /src="([\w\W]+?)"/;
  var imageList = [];

  lines.forEach((line) => {
    if (imgRegex.test(line)) {
      var res = imgRegex.exec(line);
      var imageTag = res[0];
      var imageTagRes = imageUrlRegex.exec(imageTag);
      var imageUrl = imageTagRes[1];

      if (imageUrl.startsWith("http")) {
        imageList.push(imageUrl);
      }
    }
  });

  return imageList;
}

function printUrlandImage(url) {
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

async function printImages() {
  if (!isPrinted) {
    var str = document.getElementById("imageCounter").value; // retrieve input
    imageCounter = parseInt(str); // conver to int
    document.getElementById("imageCounter").value = ""; //delete input field after submission
    document.getElementById("printButton").disabled = true;
    var pageContent = await getHTMLOfThePage(pageUrl);
    var imagesUrls = getImageUrlsFromPage(pageContent); // get only image urls in the html page
    let bar = addProgress();
    promise = promise.then(() => loader(bar, delay * imageCounter));
    var i = 0;
    function myLoop() {
      setTimeout(function () {
        printUrlandImage(imagesUrls[i]);
        i++; //  increment the counter
        if (i < imageCounter) {
          myLoop();
        }
      }, delay);
    }
    myLoop();
    isPrinted = true;
  } else {
    refreshImages();
    printImages();
  }
}

async function refreshImages() {
  var myList = document.getElementById("myList");
  var progressBar = document.getElementById("containerProgress");
  myList.innerHTML = ""; // make mylist empty
  progressBar.innerHTML = "";
  isPrinted = false;
}

function loader(element, time) {
  return new Promise((resolve) => {
    let intervalId;
    function tick() {
      element.value = parseInt(element.value, 10) + 1;
      if (element.value == element.max) {
        clearInterval(intervalId);
        resolve();
      }
    }
    setInterval(tick, time / element.max);
  });
}

function addProgress() {
  let progress = document.importNode(template.content, true);
  container.appendChild(progress);
  return container.querySelector("progress:last-child");
}
