// Saves options to localStorage.
function save_options() {
    var select = document.getElementById("num_default");
    var max = select.children[select.selectedIndex].value;

    select = document.getElementById("sel_def");
    var sel = select.children[select.selectedIndex].value;

    select = document.getElementById("win_def");
    var win = select.children[select.selectedIndex].value;

    var bb = document.getElementById("bookBox").checked;
    var lb = document.getElementById("launchBox").checked;

    console.log("bb: "+bb+" lb: "+lb);
    var status = document.getElementById("status");
    var delay;
    var restore = false;
    if(bb && lb) {
        console.log("here");
        status.innerHTML = "Save Failed: Cannot Hide Both Bookmark Section and Quick Launch";
        delay = 4000;
        restore = true;
    } else {
        localStorage["default_max"] = max;
        localStorage["default_sel"] = sel;
        localStorage["default_win"] = win;
        localStorage["hide_bookmarks"] = bb;
        localStorage["hide_quicklaunch"] = lb;
        status.innerHTML = "Options Saved.";
        delay = 1500;
    }

    // Update status to let user know options were saved.
    setTimeout(function() {
        status.innerHTML = "";
    }, delay);

    if(restore) {
        restore_options();
        restore = false;
    }
}
      
// Restores select box state to saved value from localStorage.
function restore_options() {
    setImageUrl();

    // restore bookBox and launchBox
    var bb = localStorage["hide_bookmarks"];
    var lb = localStorage["hide_quicklaunch"];

   // console.log("Restoring...");
    //console.log("bb: "+bb+" lb: "+lb);

    if(bb == "true") {
        document.getElementById("bookBox").checked = true;
    } else {
        document.getElementById("bookBox").checked = false;
    }

    if(lb == "true") {
        document.getElementById("launchBox").checked = true;
    } else {
        document.getElementById("launchBox").checked = false;
    }

    // restore default max
    var max = localStorage["default_max"];
    if (!max) {
        return;
    }
    var select = document.getElementById("num_default");
    for (var i = 0; i < select.children.length; i++) {
        var child = select.children[i];
        if (child.value == max) {
            child.selected = "true";
            break;
        }
    }

    // restore default selected
    var sel = localStorage["default_sel"];
    if (!sel) {
        return;
    }
    var select1 = document.getElementById("sel_def");
    for (var i = 0; i < select1.children.length; i++) {
        var child1 = select1.children[i];
        if (child1.value == sel) {
            child1.selected = "true";
            break;
        }
    }

    // restore default open window
    var win = localStorage["default_win"];
    if (!win) {
        return;
    }
    var select2 = document.getElementById("win_def");
    for (var i = 0; i < select2.children.length; i++) {
        var child2 = select2.children[i];
        if (child2.value == win) {
            child2.selected = "true";
            break;
        }
    }
}

function setImageUrl() {
    var url = chrome.extension.getURL("/images/DashBurst-Logo.png");
    document.getElementById('target').src = url;
}

document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);