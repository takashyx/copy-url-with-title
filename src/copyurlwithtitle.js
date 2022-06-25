window.addEventListener('keydown', copyURLWithTitle, true);

function copyURLWithTitle(event) {

    var format = "";
    var output = "";

    // capture "C"
    if (event.keyCode != 67) return;

    // check OS
    var isWin = (navigator.platform.indexOf("Win") != -1);
    var isMac = (navigator.platform.indexOf("Mac") != -1);

    // newline symbol
    var crlf_flag = "[[[br]]]";
    var crlf = isWin ? "\r\n" : "\n";
    var title_for_toast;
    var contnt_for_toast;
    var text_for_clipboard;
    var options;

    // check selection
    if (isSelected()) {
        title_for_toast = "Copied (normal copy)";
        content_for_toast = window.getSelection() + "";
        options = { style: { main: { color: "rgba(255, 255, 255, .85)", background: "rgba(0, 0, 64, .85)"} } };
        takashyx.toast.Toast(title_for_toast, content_for_toast, options);
        return;
    }
    // detect copy type
    if (((!isMac) && event.ctrlKey) || (isMac && event.metaKey)) format = "text";
    if ((event.altKey)) format = "markdown";

    if (format == "text") {
        title_for_toast = "URL with Title Copied (text format)";
        content_for_toast = document.title + crlf_flag + document.location.href + crlf_flag;
        text_for_clipboard = document.title + crlf + document.location.href + crlf;
        options = { style: { main: { color: "rgba(255, 255, 255, .85)", background: "rgba(64, 64, 0, .85)"} } };
    }

    if (format == "markdown") {
        title_for_toast = "URL with Title Copied (markdown format)";
        content_for_toast = "[" + document.title + "](" + document.location.href + ")" + crlf_flag;
        text_for_clipboard = "[" + document.title + "](" + document.location.href + ")" + crlf;
        options = {  style: { main: { color: "rgba(255, 255, 255, .85)", background: "rgba(0, 64, 0, .85)" } } };
    }

    // exec
    if(format != "") {
        navigator.clipboard.writeText(text_for_clipboard).then(()=>{
            takashyx.toast.Toast(title_for_toast, content_for_toast, options)
        }).catch((error) => { alert(`Copy failed! ${error}`) });
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

