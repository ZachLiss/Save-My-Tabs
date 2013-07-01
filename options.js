// Saves options to localStorage.
function save_options() {
    var select = document.getElementById("num_default");
    var max = select.children[select.selectedIndex].value;
    localStorage["default_max"] = max;

    // Update status to let user know options were saved.
    var status = document.getElementById("status");
    status.innerHTML = "Options Saved.";
    setTimeout(function() {
        status.innerHTML = "";
    }, 1500);
}
      
// Restores select box state to saved value from localStorage.
function restore_options() {
    var favorite = localStorage["default_max"];
    if (!favorite) {
        return;
    }
    var select = document.getElementById("num_default");
    for (var i = 0; i < select.children.length; i++) {
        var child = select.children[i];
        if (child.value == favorite) {
            child.selected = "true";
            break;
        }
    }
}

document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);