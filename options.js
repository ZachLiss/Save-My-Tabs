// Saves options to localStorage.
function save_options() {
    var select = document.getElementById("num_default");
    var max = select.children[select.selectedIndex].value;

    select = document.getElementById("sel_def");
    var sel = select.children[select.selectedIndex].value;

    localStorage["default_max"] = max;
    localStorage["default_sel"] = sel;

    // Update status to let user know options were saved.
    var status = document.getElementById("status");
    status.innerHTML = "Options Saved.";
    setTimeout(function() {
        status.innerHTML = "";
    }, 1500);
}
      
// Restores select box state to saved value from localStorage.
function restore_options() {
    setImageUrl();

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
}

function setImageUrl() {
    var url = chrome.extension.getURL("/images/DashBurst-Logo.png");
    document.getElementById('target').src = url;
}

document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);