//window.onload = initialize;
document.addEventListener('DOMContentLoaded', initialize);

/// initialize the extension when the window loads
function initialize() {

	var div = document.getElementById("listOfTabs");

	/// get all the current tabs
	chrome.tabs.getAllInWindow(null, function(tabs) {
		/// print out the number of opened tabs
		if(tabs.length == 1) {
   			document.getElementById("urlCount").innerHTML = "<strong>" + tabs.length + "</strong> URL";
   		} else {
   			document.getElementById("urlCount").innerHTML = "<strong>" + tabs.length +"</strong> URLs";
   		}

   		/// list the titles of the opened tabs
   		var divText = "<p><strong>Current Opened Tabs</strong></p>";
   		
		for(var i = 0; i < tabs.length; i++) {       
			divText += "<input type=\"checkbox\" class=\"url\" id=\"" + tabs[i].id + "\" value=\"" + tabs[i].url + "\" checked=\"true\">" + tabs[i].title + "<br>";
   		} 

   		/// set the list of tabs with checkboxes in the html
   		div.innerHTML = divText;
	});

	/// set up the proper eventListeners for the events
	document.getElementById("bookmark_button").addEventListener('click',drawBookmarks,false);
	document.getElementById("copy_button").addEventListener('click',copyUrls,false);
	document.getElementById("selector").addEventListener('click',selectorClicked,false);
	document.getElementById("selector").value = "0";

	drawDefaultOpenButtons();
}

function selectorClicked() {
	var e = document.getElementById("selector");
	console.log(e.value);
	if(e.value == "1") {
		var urls = document.querySelectorAll('.url');
		for(var i=0; i < urls.length; i++) {
			urls[i].checked = true;
		}
		e.innerHTML = "None";
		e.value = "0";
	} else {
		var urls = document.querySelectorAll('.url');
		for(var i=0; i < urls.length; i++) {
			urls[i].checked = false;
		}
		e.innerHTML = "All";
		e.value = "1";
	}
}

/// copy all of the Urls into the clipboard
function copyUrls() {
	/// initial urlString is empty
	var urlString = '';
	var checkedUrls = document.querySelectorAll('.url:checked');
	
	/// build the string to be copied
	for (var i = 0; i < checkedUrls.length; i++){
		urlString += checkedUrls[i].value + "\n";
	}
	
	/// copy the text to the clipboard
	var textarea = document.createElement('textarea');
	document.body.appendChild(textarea);
	textarea.value = urlString;
	textarea.select();
	document.execCommand('Copy');
	document.body.removeChild(textarea);	

	document.getElementById("notifications").innerHTML = "<p>Selected Urls Copied to Clipboard</p>";
	setTimeout(function() {emptyNot()}, 3000);
}

function drawBookmarks() {
	chrome.bookmarks.getTree(function(bookmarks) {
		drawBookmarkSection(bookmarks);
	});
}

/// variables needed in bookmark section
var divString;
var newFolder = false;

/// draw the bookmark section
function drawBookmarkSection(bookmarks) {
	divString = "<h2>Bookmark list</h2><div id=\"bookmark_list\"><select id=\"selected_bookmark\">";

	drawBookmarkDropdownOptions(bookmarks, -1);

	divString += "</select></div><br><div id=\"bookmark_text\"></div>";
	divString += "<div id=\"bookmark_buttons\"><button id=\"nf_button\" class=\"button\">New folder</button><button id=\"save_button\" class=\"button\">Save</button><button id=\"cancel_button\" class=\"button\">Cancel</button></div>";

	document.getElementById("bookmark_section").innerHTML = divString;

	/// add eventListeners for the new buttons that have been added
	document.getElementById("nf_button").addEventListener('click',newFolderClicked,false);
	document.getElementById("save_button").addEventListener('click',saveClicked,false);
	document.getElementById("cancel_button").addEventListener('click',cancelClicked,false);
}

/// recursively draw the dropdown menu of bookmark folders
function drawBookmarkDropdownOptions(bookmarks, depth) {
	bookmarks.forEach(function(bookmark) {
		if(bookmark.url != null) return;
		//console.log(bookmark.id + ' - ' + bookmark.title + ' - ' + bookmark.children.title);

		if(bookmark.id == 0) { drawBookmarkDropdownOptions(bookmark.children, depth+1); }
		else {
			divString += "<option value=\""+bookmark.id+"\">";
			for(var i = 0; i < depth; i++) divString += "--"; 
			divString += bookmark.title + "</option>";
		}
		if(bookmark.children && bookmark.id != 0) drawBookmarkDropdownOptions(bookmark.children, depth+1);
	});
}


/// create textfield for new folder
function newFolderClicked() {
	newFolder = true;
	var textField = document.getElementById("bookmark_text");
	textField.innerHTML = "<input type=\"text\" placeholder=\"Folder Name\" id=\"folder_name\">";
	document.getElementById("cancel_button").innerHTML = "Cancel New Folder";
}

/// save the selected urls where they need to go
function saveClicked() {
	var pId = document.getElementById("selected_bookmark").value;
	var checkedUrls = document.querySelectorAll('.url:checked');

	if(checkedUrls.length == 0) {
		document.getElementById("notifications").innerHTML = "<p>Select Urls to be Saved</p>";
		setTimeout(function() {emptyNot()}, 3000); return;
	}

	if(newFolder) {
		var newTitle = document.getElementById("folder_name").value;
		
		chrome.bookmarks.create({parentId: pId, title: newTitle}, function(result) {
			//var checkedUrls = document.querySelectorAll('.url:checked');
			for (var i = 0; i < checkedUrls.length; i++){
				chrome.bookmarks.create({parentId: result.id, title: checkedUrls[i].value, url: checkedUrls[i].value });
			}	
		});
		drawBookmarks();
		cancelClicked();
	} else {
		
		for (var i = 0; i < checkedUrls.length; i++){
			chrome.bookmarks.create({parentId: pId, title: checkedUrls[i].value, url: checkedUrls[i].value });
		}	
	}
	document.getElementById("notifications").innerHTML = "<p>bookmark saved</p>";
	setTimeout(function() {emptyNot()}, 3000);
}

/// cancel the current function
function cancelClicked() {
	if(newFolder) {
		document.getElementById("bookmark_text").innerHTML = "";
		document.getElementById("cancel_button").innerHTML = "Cancel";
		newFolder = false;
	} else {
		document.getElementById("bookmark_section").innerHTML = "";
	}
}

/// empty the notification bar
function emptyNot() {
	document.getElementById("notifications").innerHTML = "";
}

////////////////////////////////////////////////
//// Section to Manage Opening of Bookmarks ////
////////////////////////////////////////////////

/// variables needed
var divString1;
var curMax;
var bNum;

function drawDefaultOpenButtons() {
	var max = localStorage["default_max"];
	chrome.bookmarks.getTree(function(bookmarks) {
		drawBookmarkButtonsSection(bookmarks, max);
	});
}

/// draw the bookmark buttons
function drawBookmarkButtonsSection(bookmarks, max) {
	divString1 = "";
	curMax = 0;
	bNum = 1;
	drawBookmarkButtons(bookmarks, -1, max);
	if(max == -1) {
		divString1 += "<button id=\"more_button\" class=\"m_button button\">Less...</button>";
	} else {
		divString1 += "<button id=\"more_button\" class=\"m_button button\">More...</button>";
	}
	document.getElementById("open_section").innerHTML = divString1;

	/// add actionlisteners to the buttons
	bNum--;
	for(var i = 1; i <= bNum; i++) {
		document.getElementById(i).addEventListener('click',openBookmarks,false);
		document.getElementById("b_"+i).addEventListener('click',maxOrMin,false);
	}
	document.getElementById("more_button").addEventListener('click',moreOrLess,false);
}

/// dropdown or close the list of bookmark buttons
function moreOrLess() {
	if(this.innerHTML == "More...") {
		chrome.bookmarks.getTree(function(bookmarks) {
			drawBookmarkButtonsSection(bookmarks, -1);
		});
	} else {
		drawDefaultOpenButtons();
	}
}

/// draw the list of bookmark buttons (currently ignoring their depth in tree)
function drawBookmarkButtons(bookmarks, depth, max) {
	bookmarks.forEach(function(bookmark) {
		if(bookmark.url != null) return;
	
		//console.log(bookmark.id + ' - ' + bookmark.title + ' - ' + bookmark.children.title);
		if(max != -1 && curMax < max) {
			console.log(bookmark.id + ' - ' + bookmark.title + ' - ' + bookmark.children.title);
			if(bookmark.id == 0) { drawBookmarkButtons(bookmark.children, depth+1, max); }
			else {
				divString1 += "<div id=\"bd_"+bNum+"\">";
				divString1 += "<button class=\"b_button button\" id=\""+bNum+"\" value=\""+bookmark.id+"\">";
				//for(var i = 0; i < depth; i++) divString1 += "--"; 
				divString1 += bookmark.title + "</button>";
				divString1 += "<button class=\"p_button button\" id=\"b_"+bNum+"\" value=\""+bNum+"\">+</button>";
				divString1 += "<div id=\"d_"+bNum+"\"></div></div>";
				curMax++;
				bNum++;
			}
			if(bookmark.children && bookmark.id != 0) drawBookmarkButtons(bookmark.children, depth+1, max);
		} else if(max == -1){
			//console.log(bookmark.id + ' - ' + bookmark.title + ' - ' + bookmark.children.title);
			if(bookmark.id == 0) { drawBookmarkButtons(bookmark.children, depth+1, max); }
			else {
				divString1 += "<div id=\"bd_"+bNum+"\">";
				divString1 += "<button class=\"b_button button\" id=\""+bNum+"\" value=\""+bookmark.id+"\">";
				//for(var i = 0; i < depth; i++) divString1 += "--"; 
				divString1 += bookmark.title + "</button>";
				divString1 += "<button class=\"p_button button\" id=\"b_"+bNum+"\" value=\""+bNum+"\">+</button>";
				divString1 += "<div id=\"d_"+bNum+"\"></div></div>";
				bNum++;
			}
			if(bookmark.children && bookmark.id != 0) drawBookmarkButtons(bookmark.children, depth+1, max);
		}
	});
}

/// maximize or minimize the clicked bookmark folder
function maxOrMin() {
	var html = this.innerHTML;
	var id = document.getElementById(this.value).value;
	var val = this.value;
	var s = "";
	
	if(html == "+") {
		/// add all the urls to the div with id d_this.value
		chrome.bookmarks.getChildren(id, function(bookmarks){
			console.log(bookmarks);
			var bIds = new Array();
			bookmarks.forEach(function(bookmark) {
				if(bookmark.url == null) return;
				s += "<div id=\"xd_"+bookmark.id+"\"><button id=\"x_"+bookmark.id+"\" value=\""+bookmark.id+"\">X</button>";
				s += "<a id=\"a_"+bookmark.id+"\" value=\""+bookmark.url+"\" href=\"#\">"+bookmark.url+"</a></div>";
				//s += "<a href=\""+bookmark.url+"\" target=\"_blank\">"+bookmark.url+"</a></div>";
				bIds.push(bookmark.id);
			});

			s += "<button id=\"b_"+id+"\" class=\"d_button\" value=\""+val+"\">Delete: "+document.getElementById(val).innerHTML+"</button>";
			console.log(s);
			document.getElementById("d_"+val).innerHTML = s;

			document.getElementById("b_"+id).addEventListener('click',dClicked,false);
			for(var i = 0; i < bIds.length; i++) {
				document.getElementById("x_"+bIds[i]).addEventListener('click',xClicked,false);
				document.getElementById("a_"+bIds[i]).addEventListener('click',aClicked,false);
			}
		});
		
		this.innerHTML = "-";
	} else {
		document.getElementById("d_"+val).innerHTML = "";
		this.innerHTML = "+";
	}
}

/// delete the folder
function dClicked() {
	var id = document.getElementById(this.value).value;
	var val = this.value;
	chrome.bookmarks.removeTree(id);
	document.getElementById("bd_"+val).innerHTML="";
}

/// delete the url
function xClicked() {
	chrome.bookmarks.remove(this.value);
	document.getElementById("xd_"+this.value).innerHTML = "";
}

/// open the url
function aClicked() {
	var win = document.getElementById("rad").checked;
	if(win) {
		chrome.tabs.create({url: this.innerHTML,active: false});
	} else {
		chrome.windows.create({left: 10,focused: false, url: this.innerHTML});
	}
}

/// open all urls in bookmark folder
function openBookmarks() {
	var id = document.getElementById(this.id).value;
	var urls = new Array();
	
	chrome.bookmarks.getChildren(id, function(bookmarks){
			bookmarks.forEach(function(bookmark){
				if(bookmark.url == null) return;
				urls.push(bookmark.url);
			});
		var win = document.getElementById("rad").checked;
		if(win) {
			urls.forEach(function(link) {
				chrome.tabs.create({url: link, active: false});
			});
		} else {
			chrome.windows.create({left: 10,focused: false, url: urls});
		}
	});
}
