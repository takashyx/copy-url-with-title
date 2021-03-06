window.addEventListener('keydown', copyURLWithTitle, true);

function copyURLWithTitle(event) {

    var format = "";
    var output = "";

    // capture "C"
    if (event.keyCode != 67) return;

    // check OS
    var isWin = (navigator.platform.indexOf("Win") != -1);
    var isMac = (navigator.platform.indexOf("Mac") != -1);

    // check selection
    if (isSelected()) return;

    // detect copy type
    if (((!isMac) && event.ctrlKey) || (isMac && event.metaKey)) format = "text";
    if ((event.altKey)) format = "markdown";

    // newline symbol
    var crlf_flag = "[[[br]]]";
    var crlf = isWin ? "\r\n" : "\n";
    var options;

    if (format == "text") {
        text_for_toast = document.title + crlf_flag + document.location.href + crlf_flag;
        text_for_clipboard = document.title + crlf + document.location.href + crlf;
        options = { settings: {duration: 3000}, style: { main: { color: "rgba(255, 255, 255, .85)", background: "rgba(0, 0, 0, .85)"} } };
    }

    if (format == "markdown") {
        text_for_toast = "[" + document.title + "](" + document.location.href + ")" + crlf_flag;
        text_for_clipboard = "[" + document.title + "](" + document.location.href + ")" + crlf;
        options = { settings: {duration: 3000}, style: { main: { color: "rgba(255, 255, 255, .85)", background: "rgba(0, 32, 0, .85)" } } };
    }

    // exec
    if(format != "") {
        chrome.runtime.sendMessage({command: "saveToClipboard", text: text_for_clipboard });
        takashyx.toast.Toast("Copied (" + format + " format): " + crlf_flag + crlf_flag + text_for_toast, options);
    }
}

function isSelected() {

    // detect by range count
    var sel = window.getSelection();
    if (sel.rangeCount <= 0) return false;
    if (sel.rangeCount > 1)  return true;

    // when sel.rangeCount == 1
    var range = sel.getRangeAt(0);
    if (! range.collapsed) return true;
    if (range.startContainer != range.endContainer) return true;
    if (range.startOffset    != range.endOffset)    return true;
    if (document.activeElement.tagName.toLowerCase() != "body") return true;

    return false;
}

