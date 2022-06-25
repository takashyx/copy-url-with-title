
"use strict";

var takashyx = takashyx || {};

takashyx.toast = (function () {

	/**
	 * The main Toast object
	 * @param {Object} options See Toast.prototype.DEFAULT_SETTINGS for more info
	 */
	function Toast(title, content, options) {
		if (getToastStage() != null) {
			// If there is already a Toast being shown, hide it
			Toast.prototype.destroy();
		}
		var _options = options || {};
		_options = Toast.prototype.mergeOptions(Toast.prototype.DEFAULT_SETTINGS, _options);

		Toast.prototype.show(title, content, _options);

		_options = null;
	};


	/**
	 * The toastStage. This is the HTML element in which the toast resides
	 * Getter and setter methods are available privately
	 * @type {Element}
	 */
	var _toastStage = null;
	function getToastStage() {
		return _toastStage;
	};
	function setToastStage(toastStage) {
		_toastStage = toastStage;
	};


	/**
	 * The Toast animation speed; how long the Toast takes to move to and from the screen
	 * @type {Number}
	 */
	Toast.prototype.TOAST_ANIMATION_SPEED = 400;

	// Toast classes
	Toast.prototype.CLASS_TOAST_GONE = "takashyx_toast_gone";
	Toast.prototype.CLASS_TOAST_VISIBLE = "takashyx_toast_visible";
	Toast.prototype.CLASS_TOAST_ANIMATED = "takashyx_toast_animated";


	/**
	 * The default Toast settings
	 * @type {Object}
	 */
	Toast.prototype.DEFAULT_SETTINGS = {
		style: {
			main: {
				"background": "rgba(0, 0, 0, .85)",
				"box-shadow": "0 0 10px rgba(0, 0, 0, .9)",

				"border-radius": "5px",

				"z-index": "99999",

				"color": "rgba(255, 255, 255, .9)",

				"max-width": "60%",
				"word-break": "keep-all",
				"text-align": "center",

				"position": "fixed",
				"left": "0",
				"right": "0",

				"margin": "0px auto",
				"padding": "10px"
			},
			title: {
				"font-weight": "bold",
				"font-size": "1.5rem",
				"margin": "0px, 6px, 6px, 6px",
				"padding": "4px",
			},
			content: {
				"margin": "6px",
				"padding": "4px",
				"border": "1px solid white",
				"border-radius": "5px",
			}
		},
		settings: {
			duration: 2500
		}
	};


	/**
	 * Specifies whether or not the inline style in the <head> exists. It only needs to be added once to a page
	 * @type {Boolean}
	 */
	Toast.prototype.styleExists = false;


	/**
	 * The Timeout object for animations.
	 * This should be shared among the Toasts, because timeouts may be cancelled e.g. on explicit call of hide()
	 * @type {Object}
	 */
	Toast.prototype.timeout = null;


	/**
	 * Merge the DEFAULT_SETTINGS with the user defined options if specified
	 * @param  {Object} options The user defined options
	 */
	Toast.prototype.mergeOptions = function (initialOptions, customOptions) {
		var merged = customOptions;
		for (var prop in initialOptions) {
			if (merged.hasOwnProperty(prop)) {
				if (initialOptions[prop] != null && initialOptions[prop].constructor == Object) {
					merged[prop] = Toast.prototype.mergeOptions(initialOptions[prop], merged[prop]);
				}
			} else {
				merged[prop] = initialOptions[prop];
			}
		}
		return merged;
	};


	/**
	 * Add the inline stylesheet to the <head>
	 * These inline styles are needed for animation purposes.
	 */
	Toast.prototype.initializeStyles = function () {
		if (Toast.prototype.styleExists) return;

		var style = document.createElement("style");

		style.insertAdjacentHTML("beforeend",
			Toast.prototype.generateInlineStylesheetRules(this.CLASS_TOAST_GONE, {
				"opacity": "0",
				"top": "10%"
			}) +
			Toast.prototype.generateInlineStylesheetRules(this.CLASS_TOAST_VISIBLE, {
				"opacity": "0.9",
				"top": "10%"
			}) +
			Toast.prototype.generateInlineStylesheetRules(this.CLASS_TOAST_ANIMATED, {
				"transition": "opacity " + this.TOAST_ANIMATION_SPEED + "ms, bottom " + this.TOAST_ANIMATION_SPEED + "ms"
			})
		);

		document.head.appendChild(style);
		style = null;

		// Notify that the stylesheet exists to avoid creating more
		Toast.prototype.styleExists = true;
	};


	/**
	 * Generate the Toast with the specified content.
	 * @param  {String} title The content to show inside the Toast, can be an HTML element or plain content
	 * @param  {String|Object} content The content to show inside the Toast, can be an HTML element or plain content
	 * @param  {Object} style style to set for the Toast
	 */
	Toast.prototype.generate = function (title, content, style) {

		var toastStage = document.createElement("div");
		var titleDiv = document.createElement("div");
		titleDiv.appendChild(document.createTextNode(title));

		toastStage.appendChild(titleDiv);

		var contentDiv = document.createElement("div");
		/**
		 * If the content is a String, create a textNode for appending
		 */
		if (typeof content === "string") {

			var lines = content.split('[[[br]]]');

			for (var i in lines) {
				var l = document.createTextNode(lines[i]);
				contentDiv.appendChild(l);
			}
		}
		else {
			contentDiv.appendChild(content);
		}

		toastStage.appendChild(contentDiv);
		setToastStage(toastStage);
		toastStage = null;

		Toast.prototype.stylize(getToastStage(), style.main);
		Toast.prototype.stylize(titleDiv, style.title);
		Toast.prototype.stylize(contentDiv, style.content);
	};

	/**
	 * Stylize the Toast.
	 * @param  {Element} element The HTML element to stylize
	 * @param  {Object}  styles  An object containing the style to apply
	 * @return                   Returns nothing
	 */
	Toast.prototype.stylize = function (element, styles) {
		Object.keys(styles).forEach(function (style) {
			element.style[style] = styles[style];
		});
	};


	/**
	 * Generates styles to be used in an inline stylesheet. The output will be something like:
	 * .class {background: blue;}
	 * @param  {String} elementClass The class of the element to style
	 * @param  {Object} styles       The style to insert into the inline stylsheet
	 * @return {String}              The inline style as a string
	 */
	Toast.prototype.generateInlineStylesheetRules = function (elementClass, styles) {
		var out = "." + elementClass + "{";

		Object.keys(styles).forEach(function (style) {
			out += style + ":" + styles[style] + ";";
		});
		out += "}";

		return out;
	};


	/**
	 * Show the Toast
	 * @param  {String} title content to show inside the Toast
	 * @param  {Object} content The content to show inside the Toast
	 * @param  {Object} options The object containing the options for the Toast
	 */
	Toast.prototype.show = function (title, content, options) {
		this.initializeStyles();
		this.generate(title, content, options.style);

		var toastStage = getToastStage();
		toastStage.classList.add(this.CLASS_TOAST_ANIMATED);
		toastStage.classList.add(this.CLASS_TOAST_GONE);
		document.body.insertBefore(toastStage, document.body.firstChild);

		// This is a hack to get animations started. Apparently without explicitly redrawing, it'll just attach the class and no animations would be done
		toastStage.offsetHeight;

		toastStage.classList.remove(this.CLASS_TOAST_GONE);
		toastStage.classList.add(this.CLASS_TOAST_VISIBLE);

		var toastStage = null;

		clearTimeout(Toast.prototype.timeout);
		Toast.prototype.timeout = setTimeout(Toast.prototype.hide, options.settings.duration);
	};


	/**
	 * Hide the Toast that's currently shown
	 */
	Toast.prototype.hide = function () {
		var toastStage = getToastStage();
		toastStage.classList.remove(Toast.prototype.CLASS_TOAST_VISIBLE);
		toastStage.classList.add(Toast.prototype.CLASS_TOAST_GONE);
		toastStage = null;

		// Destroy the Toast element after animations end
		clearTimeout(Toast.prototype.timeout);
		Toast.prototype.timeout = setTimeout(Toast.prototype.destroy, Toast.prototype.TOAST_ANIMATION_SPEED);
	};


	/**
	 * Clean up after the Toast slides away. Namely, removing the Toast from the DOM.
	 */
	Toast.prototype.destroy = function () {
		var toastStage = getToastStage();
		document.body.removeChild(toastStage);

		toastStage = null;
		setToastStage(null);
	};

	return {
		Toast: Toast
	};
})();