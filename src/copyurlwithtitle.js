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
    var options_for_toast;
    var show_toast = false;
    var override_copy = false;

    //get options
    chrome.storage.sync.get(function (items) {
        console.log("copyurlwithtitle.js");
        console.log(items);

        // detect copy type
        if (((!isMac) && event.ctrlKey) || (isMac && event.metaKey)) {

            // check selection
            if (isSelected()) {
                format = "normal";
            }
            else {
                format = "text";
            }
        }

        if ((event.altKey)) format = "markdown";

        if (format === "normal" && items["show-normal"]) {
            title_for_toast = "Copied(Normal):";
            content_for_toast = window.getSelection() + crlf_flag;
            options_for_toast = { style: { main: { color: items["normal-text-color"], background: items["normal-bg-color"] } }, settings: { duration: parseInt(items["toast-duration"]) } };
            takashyx.toast.Toast(title_for_toast, content_for_toast, options_for_toast);
            console.log("toast options: " + JSON.stringify(options_for_toast));
            show_toast = true;
        }
        else if (format === "text" && items["show-text"]) {
            title_for_toast = "URL with Title Copied(Text):";
            content_for_toast = document.title + crlf_flag + document.location.href + crlf_flag;
            text_for_clipboard = document.title + crlf + document.location.href + crlf;
            options_for_toast = {
                style: { main: { color: items["text-format-text-color"], background: items["text-format-bg-color"] } }, settings: { duration: parseInt(items["toast-duration"]) }
            };
            show_toast = true;
            override_copy = true;
        }

        else if (format === "markdown" && items["show-markdown"]) {
            title_for_toast = "URL with Title Copied(Markdown):";
            content_for_toast = "[" + document.title + "](" + document.location.href + ")" + crlf_flag;
            text_for_clipboard = "[" + document.title + "](" + document.location.href + ")" + crlf;
            options_for_toast = { style: { main: { color: items["markdown-format-text-color"], background: items["markdown-format-bg-color"] } }, settings: { duration: parseInt(items["toast-duration"]) } };
            show_toast = true;
            override_copy = true;
        }

        // exec
        if (show_toast) {
            takashyx.toast.Toast(title_for_toast, content_for_toast, options_for_toast);
            console.log("toast options: " + JSON.stringify(options_for_toast));
        }
        if (override_copy) {
            if (navigator.clipboard && window.isSecureContext) {
                // navigator clipboard api method'
                console.log("Copy for https page ( navigator.clipboard.writeText()')");
                navigator.clipboard.writeText(text_for_clipboard).then(() => {
                }).catch((error) => { alert(`Copy failed! ${error}`) });
            } else {
                // text area method
                console.log("Copy for non-https page ( document.execCommnad('copy')");
                let textArea = document.createElement("textarea");
                textArea.value = text_for_clipboard;
                // make the textarea out of viewport
                textArea.style.position = "fixed";
                textArea.style.left = "-999999px";
                textArea.style.top = "-999999px";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                return new Promise((res, rej) => {
                    // here the magic happens
                    document.execCommand('copy') ? res() : rej();
                    textArea.remove();
                });
            }
        }
    });
}

function isSelected() {

    // detect by range count
    var sel = window.getSelection();
    if (sel.rangeCount <= 0) return false;
    if (sel.rangeCount > 1) return true;

    // when sel.rangeCount == 1
    var range = sel.getRangeAt(0);
    if (!range.collapsed) return true;
    if (range.startContainer != range.endContainer) return true;
    if (range.startOffset != range.endOffset) return true;
    if (document.activeElement.tagName.toLowerCase() != "body") return true;

    return false;
}

