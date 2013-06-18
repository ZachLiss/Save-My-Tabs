window.onload = initialize;

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
			divText += "<input type=\"checkbox\" class=\"url\" id=\"" + tabs[i].id + "\" value=\"" + tabs[i].url + "\">" + tabs[i].title + "<br>";
   		} 

   		/// set the list of tabs with checkboxes in the html
   		div.innerHTML = divText;
	});

	/// set up the proper eventListeners for the events
	document.getElementById("bookmark_button").addEventListener('click',getBookmarks,false);
	document.getElementById("copy_button").addEventListener('click',copyUrls,false);
	document.getElementById("selector").addEventListener('click',selectorClicked,false);
	document.getElementById("selector").value = "1";
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

function getBookmarks() {
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

