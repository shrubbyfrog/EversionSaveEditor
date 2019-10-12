// Script written by Oswald "shrubbyfrog" 2019
// Script adapted by hy 2019
$(document).ready(function () {
	// Variable initializations
	var fileContents;
	var fileVersion;
	
	// Sets game version HTML data's default state
	document.getElementById("gameVersion").innerHTML = "N/A";
	
	// Variable initializations for saving the file
	var saveButton = document.getElementById("saveFile");
	var download = document.querySelector("a[download]");
	var downloadUrl = null;
	saveButton.addEventListener("input",downloadFile,false);
	
	// Initializes world ID array
	var worldArray = ["#worldTwo", "#worldThree", "#worldFour", "#worldFive", "#worldSix", "#worldSeven", "#worldEight"];
	// Initializes gem ID array
	var gemsArray = ["#worldOneGems", "#worldTwoGems", "#worldThreeGems", "#worldFourGems", "#worldFiveGems", "#worldSixGems", "#worldSevenGems"];
	// Initializes letter ID array
	var lettersArray = ["#letterOne","#letterTwo","#letterThree","#letterFour","#letterFive","#letterSix","#letterSeven","#letterEight"];
	
	// --------------
	// FILE VALIDITY CHECKS
	// --------------
	
	$("#loadFile").click(function () {
		var uploadedFile = $("#uploadFile").prop("files")[0];
		
		if (uploadedFile == undefined) {
			hasNoSave();
		} else {
			switch (uploadedFile.name){
				case "save.sav":
					isValidSave(uploadedFile, worldArray, gemsArray, lettersArray);
					break;
				default:
					isInvalidSave();
					break;
			}
		}
	});
	
	// --------------
	// INITIALIZATION ROUTINE
	// --------------
	
	function isValidSave(uploadedFile, worldArray, gemsArray, lettersArray) {
	document.getElementById("uploadError").innerHTML = "";
	$("#saveFile").prop("disabled",false);
	
	// FileUpload API, hooray !
	readFile(uploadedFile, function(e) {
		fileContents = hexEncode(e.target.result);
		fileContents = fileContents.split("5b");
		
		fileVersion = fileContents.length-10;
		var gameVersion = "N/A";
		var numPaddedHedgehogs = 0;
		
		if (fileContents[0] == "0408") {
			// Toggles true menu checkbox based on file data
			var generalBytes = fileContents[2].split("69");
			
			if (generalBytes[2] == 06) {
				$("#trueMenu").prop("checked",true);
			} else {
				$("#trueMenu").prop("checked",false);
			}
			
			// Toggles unlocked world checkboxes based on file data
			var worldMaxUnlock = parseInt("0x" + generalBytes[1], 16) - 6;
			$(".worlds").prop("checked",false);
			for (var i = 0; i < worldMaxUnlock; i++) {
				$(worldArray[i]).prop("checked",true);
			}
			
			$("#trueMenu").prop("disabled",false);
			$(".worlds").prop("disabled",false);
			$(".gems").prop("disabled",false);
			$(".clears").prop("disabled",false);
			$(".selects").prop("disabled",false);
			$(".letters").prop("disabled",true);
			$("#letterClear").prop("disabled",true);
			$("#letterSelect").prop("disabled",true);
			switch (fileVersion){
				case 0:
					gameVersion = "1.4.x or 1.5.x"
					break;
				case 1:
					gameVersion = "1.7.x"
					numberPaddedHedgehogs = 1;
					break;
				case 3:
					gameVersion = "HD"
					$(".letters").prop("disabled",false);
					$("#letterClear").prop("disabled",false);
					$("#letterSelect").prop("disabled",false);
					numberPaddedHedgehogs = 3;
					break;
				default:
					isInvalidSave();
			}
		}
		
		document.getElementById("gameVersion").innerHTML = gameVersion;
		switch (fileContents[0]){
			case "0408":
				// Toggles collected gem checkboxes based on file data
				for (var i = 0; i < gemsArray.length; i++){
					var generalBytes = fileContents[3+fileVersion+i].split("69");
					generalBytes.shift(); // Removes initial byte to prevent any funny business
					if (generalBytes.every(checkArrayValue)) {
						$(gemsArray[i]).prop("checked",true);
					} else {
						$(gemsArray[i]).prop("checked",false);
					}
				}
					
				// Toggles collected letter checkboxes based on file data (ONLY FOR HD)
				if (fileVersion == 3){
					var generalBytes = fileContents[5].split("69");
					for (var i = 0; i < lettersArray.length; i++){
						((generalBytes[i+1] == "06") ? $(lettersArray[i]).prop("checked",true) : $(lettersArray[i]).prop("checked",false));
					}
				}
				break;
			default:
				IsInvalidSave();
				break;
			}
		});
	}
	
	// --------------
	// VISUALISATION AND SERIALISATION
	// --------------
		// True Menu Unlock
		$("#trueMenu").click(function () {
			var generalBytes = fileContents[2].split("69");
			if (this.checked == true) generalBytes[2] = "06";
			else generalBytes[2] = "00";
			generalBytes.join();
			generalBytes = generalBytes.toString().replace(/\,/g, "69");
			fileContents[2] = generalBytes;
		});
		
		// World Unlocks
		worldArray.forEach(function(world){
			$(world).click(function () {
				var generalBytes = fileContents[2].split("69");
				var currentWorld = worldArray.indexOf(world);
				if (!this.checked) {currentWorld -= 1;}
				for (var i = 0; i < worldArray.length; i++){
					if (i <= currentWorld) $(worldArray[i]).prop("checked",true);
					else $(worldArray[i]).prop("checked",false);
				}
				var serialWorld = currentWorld + 7;
				generalBytes[1] = "0" + serialWorld.toString(16);
				generalBytes.join();
				generalBytes = generalBytes.toString().replace(/\,/g, "69");
				fileContents[2] = generalBytes;
			});
			
			// Ame im going to perish you for making me do this
			// Redundancy below vvvvv
			$("#worldClear").click(function () {
				worldEnMasse("06", false);
			});
			
			$("#worldSelect").click(function () {
				worldEnMasse("0D", true);
			});
		});
		
		// Gem Collects
		gemsArray.forEach(function(world){
			$(world).click(function(){
				var index = 3+fileVersion+gemsArray.indexOf(world);
				var generalBytes = fileContents[index].split("69");
				var leadingByte = generalBytes.shift(); // Removes and stores initial byte
				if (this.checked == true){
					for (var i = 0; i < generalBytes.length; i++){
						generalBytes[i] = "00"; // Collected gems are represented by "00"
					}
				}
				else {
					generalBytes[i] = "06";	// Uncollected gems are represented by "06"
				}
				generalBytes.unshift(leadingByte); // Restores removed byte
				generalBytes.join();
				generalBytes = generalBytes.toString().replace(/\,/g, "69");
				fileContents[index] = generalBytes;
			});
			
			$("#gemClear").click(function(){
				var index = 3+fileVersion+gemsArray.indexOf(world);
				letterEnMasse(06, false);
			});
			
			$("#gemSelect").click(function(){
				var index = 3+fileVersion+gemsArray.indexOf(world);
				letterEnMasse(00, true);
			});
		});
		
		// Letter Collects (ONLY FOR HD)
		lettersArray.forEach(function(letter){
			$(letter).click(function(){
				var generalBytes = fileContents[5].split("69");
				var index = lettersArray.indexOf(letter)+1;
				if (this.checked == true) generalBytes[index] = "06";	// Collected letters are represented by "06"
				else generalBytes[index] = "00";	// Uncollected letters are represented by "00"
				generalBytes = generalBytes.toString().replace(/\,/g, "69");
				fileContents[5] = generalBytes;
			});
		});
		
		// Clears all letters
		$("#letterClear").click(function(){
			letterEnMasse(00, false);
		});
		
		// Selects all letters
		$("#letterSelect").click(function(){
			letterEnMasse(06, true);
		});
		
	$("#saveFile").click(function () {
		compiledContents = fileContents.toString().replace(/\,/g, "5b");
		var encodedContents = hexDecode(compiledContents);
		downloadFile(encodedContents, downloadUrl, download);
	});
});

// --------------
// FUNCTIONS
// --------------
function readFile(file, callback) {
    var reader = new FileReader();
    reader.onload = callback
    reader.readAsText(file);
}

function checkArrayValue(value) {
	return value == "00";
}

function hexEncode(input) {
    var str = "";
    for (var i = 0; i < input.length; i++) {
        str += input[i].charCodeAt(0).toString(16).padStart(2, "0");
    }
    return str;
}

function hexDecode(input) {
    var input = input.toString();
    var str = "";
    for (var i = 0; i < input.length; i += 2)
        str += String.fromCharCode(parseInt(input.substr(i, 2), 16));
    return str;
}

function downloadFile(file, memory, target) {
	// save.sav blob
	var producedFile = new Blob([file], {type:"application/octet-stream"});

	if (memory) {
		URL.revokeObjectURL(memory);
	}

	memory = URL.createObjectURL(producedFile);
	target.setAttribute("href", memory);
}

function hasNoSave(){
	document.getElementById("uploadError").innerHTML = "Please upload a file.";
	disableEditing();
}

function isInvalidSave() {
	document.getElementById("uploadError").innerHTML =  "Not a valid save.sav file.";
	disableEditing();
}
function disableEditing(){
	document.getElementById("gameVersion").innerHTML = "N/A";
	$("#saveFile").prop("disabled",true);
	
	$("#trueMenu").prop("disabled",true);
	$("#trueMenu").prop("checked",false);
	$(".worlds").prop("disabled",true);
	$(".worlds").prop("checked",false);
	$(".gems").prop("disabled",true);
	$(".gems").prop("checked",false);
	$(".letters").prop("disabled",true);
	$(".letters").prop("checked",false);
	$(".clears").prop("disabled",true);
	$(".selects").prop("disabled",true);
}

// Select all/Clear all button code
function worldEnMasse(value, checkedState, fileContents) {
	var generalBytes = fileContents[2].split("69");
	generalBytes[1] = value.toString;
	for (var i = 0; i < worldArray.length; i++) {
		$(worldArray[i]).prop("checked",checkedState);
	}
	generalBytes.join();
	generalBytes = generalBytes.toString().replace(/\,/g, "69");
	fileContents[2] = generalBytes;
}

function gemEnMasse(value, checkedState) {
	var generalBytes = fileContents[index].split("69");
	var leadingByte = generalBytes.shift(); // Removes and stores initial byte
	for (var i = 0; i < generalBytes.length; i++) {
		$(gemsArray[i]).prop("checked",checkedState);
		generalBytes[i] = value.toString(); // Uncollected gems are represented by "06"
	}
	generalBytes.unshift(leadingByte); // Restores removed byte
	generalBytes.join();
	generalBytes = generalBytes.toString().replace(/\,/g, "69");
	fileContents[index] = generalBytes;
}

function letterEnMasse(value, checkedState) {
	var generalBytes = fileContents[5].split("69");
	for (var i = 1; i < lettersArray.length+1; i++) {
		$(lettersArray[i]).prop("checked",checkedState);
		generalBytes[i] = value.toString();
	}
	generalBytes = generalBytes.toString().replace(/\,/g, "69");
	fileContents[5] = generalBytes;
}