var default_options = {
	"show-normal": true,
	"show-text": true,
	"show-markdown": true,

	"normal-text-color": "#ffffff",
	"normal-bg-color": "#000000",

	"text-format-text-color": "#ffffff",
	"text-format-bg-color": "#606000",

	"markdown-format-text-color": "#ffffff",
	"markdown-format-bg-color": "#006000"
};

var options = {};

function checkAndRestore() {
	console.log("checkAndRestore")
	chrome.storage.sync.get(function (items) {
		if (!Object.keys(items).length) {
			console.log("checkAndRestore detected no settings. restore default");
			chrome.storage.sync.set(default_options, function (r) {
				console.log("restore default:");
				console.log(default_options);
				document.querySelector("#msg").innerText = "restored default settings.";
				updateGUI(default_options);
			});
		}
	});
}

function updateGUI(items) {
	console.log('update-gui:')
	console.log(items);
	Object.keys(items).forEach(function (key) {
		options[key] = items[key]
		t = document.getElementById(key)
		if (t) {
			if ('checkbox' === t.type) t.checked = items[key];
			else t.value = items[key];
		}
	});

	// update previews
	p = document.querySelector("#preview-normal");
	if (p) {
		console.log("preview-normal update");
		p.style.background = document.querySelector("#normal-bg-color").value;
		p.style.color = document.querySelector("#normal-text-color").value;
		p.opacity = 0.9;
	}

	p = document.querySelector("#preview-text");
	if (p) {
		console.log("preview-text update");
		p.style.background = document.querySelector("#text-format-bg-color").value;
		p.style.color = document.querySelector("#text-format-text-color").value;
		p.opacity = 0.9;
	}

	p = document.querySelector("#preview-markdown");
	if (p) {
		console.log("preview-markdown update");
		p.style.background = document.querySelector("#markdown-format-bg-color").value;
		p.style.color = document.querySelector("#markdown-format-text-color").value;
		p.opacity = 0.9;
	}
}

document.addEventListener('DOMContentLoaded', (e) => {
	checkAndRestore();
	var b = document.querySelector("#restore-copy-url-with-title-defaults");
	if (b) {
		chrome.storage.sync.get(function (items) { updateGUI(items); })
		b.addEventListener('click', function (e) {
			console.log("restore");
			chrome.storage.sync.clear(function (r) {
				checkAndRestore();
			});
		});
	}
});

document.querySelectorAll(".copy-url-with-title-input").forEach((elm) => {
	elm.addEventListener("change", (e) => {
		var p;

		if (elm.classList.contains("normal")) {
			p = document.querySelector("#preview-normal");
			p.style.background = document.querySelector("#normal-bg-color").value;
			p.style.color = document.querySelector("#normal-text-color").value;
			console.log("normal preview update by change");
		}
		if (elm.classList.contains("text-format")) {
			p = document.querySelector("#preview-text");
			p.style.background = document.querySelector("#text-format-bg-color").value;
			p.style.color = document.querySelector("#text-format-text-color").value;
			console.log("text format preview update by change");
		}
		if (elm.classList.contains("markdown-format")) {
			p = document.querySelector("#preview-markdown");
			p.style.background = document.querySelector("#markdown-format-bg-color").value;
			p.style.color = document.querySelector("#markdown-format-text-color").value;
			console.log("markdown format preview update by change");
		}

		if ("checkbox" === elm.type) {
			options[e.target.id] = e.target.checked;
		}
		else {
			options[e.target.id] = e.target.value;
		}

		chrome.storage.sync.set(options, function (result) {
			console.log("update storage");
			console.log(options);
			document.querySelector("#msg").innerText = "Set " + e.target.id + " to " + options[e.target.id];
		});
	});
});