var Socket = Class.extend({
	init: function(obj, settings) {
		var accept = ".meeple-" + settings.type;
		var holder = obj.view.socketHolder;
		if (settings.holder)
			holder = settings.holder;

		if (settings.isHomeSocket)
			accept = ".meeple-" + obj.key;

		this.obj = obj;

		this.holder = $("<div/>", {
			class: "socket-holder"
		}).appendTo(holder);

		if (settings && settings.showLabel) {
			this.label = $("<div/>", {
				html: settings.label,
				class: "socket-label"
			}).appendTo(this.holder);
		}

		this.div = $("<div/>", {
			class: "socket socket-" + settings.label,
			id: "socket-" + settings.label + "-" + obj.key
		}).appendTo(this.holder).droppable({

			activeClass: "droppable-active",
			hoverClass: "droppable-hover",


			accept: accept,

			drop: function() {
				dropTarget = obj;
				dropTargetLabel = settings.label;
				console.log("dropped on " + obj.key);
			}
		});

		if (settings && settings.minWidth) {

			this.div.css({
				minWidth: settings.minWidth,
				minHeight: settings.minHeight,

			})
		}

		if (settings.isHomeSocket) {
			this.div.dblclick(function() {
				obj.reset();
			});
		}
	}
});


var Meeple = Class.extend({

	init: function(obj) {
		var meeple = this;

		this.obj = obj;
		this.div = this.createMeeple();
		this.div.draggable({
			helper: function() {
				return meeple.createMeeple("-dragging");
			},

			start: function() {
				dropTarget = undefined;
				dropTargetLabel = undefined;
				held = this;
				meeple.remove();

				console.log(meeple.obj.type);
				if (meeple.obj.type === "paper") {
					openPanel("calendar");

				} else {
					openPanel("projects");
				}
			},

			stop: function() {
				console.log("stopped dragging " + obj.key + " on ", dropTarget);
				held = undefined;

				// return to the home socket



				meeple.moveTo(dropTarget, dropTargetLabel);
				if (dropTargetLabel === "brainstorm")
					openPanel("whiteboard");


			},
			appendTo: "#drag-overlay"
		});

		this.moveTo();
	},

	remove: function() {
		this.currentLocation = undefined;
		this.currentLocationLabel = undefined;
		this.div.detach();
	},

	moveTo: function(target, label) {

		if (!target)
			target = this.obj;

		if (!label)
			label = "home";

		this.currentLocation = target;
		this.currentLocationLabel = label;
	
		target.sockets[label].div.append(this.div);

		this.obj.setActivity(label, target);

	},

	createMeeple: function(label) {
		var div = $("<div/>", {
			class: "meeple meeple-" + this.obj.type + " meeple-" + this.obj.key,
			id: "meeple-" + this.obj.key,

		}).css({
			backgroundColor: "hsl(" + this.obj.hue + ",50%, 30%)",
			boxShadow: " inset -1px -2px 0px 1px hsl(" + this.obj.hue + ",50%, 20%), 0px 2px 5px 0px hsla(" + this.obj.hue + ",50%, 5%, .4)"
		});

		var icon = $("<div/>", {
			class: "icon icon-" + this.obj.type,
			html: svg[this.obj.type]
		}).appendTo(div);

		icon.css({
			fill: "hsl(" + this.obj.hue + ",50%, 70%)"
		});


		return div;
	}
});


var shadow = ' <defs> <filter id="f3" x="0" y="0" width="200%" height="200%"><feOffset result="offOut" in="SourceAlpha" dx="20" dy="20" /><feGaussianBlur result="blurOut" in="offOut" stdDeviation="10" /><feBlend in="SourceGraphic" in2="blurOut" mode="normal" /></filter></defs>';

var svg = {
	researcher: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve">' + shadow + '<path fill-rule="evenodd" clip-rule="evenodd" d="M99.992,43.019c0.578-13.757-32.354-20.455-33.781-22.023  C65.5,20.216,67.861-0.015,50,0C32.139-0.015,34.499,20.216,33.788,20.996c-1.427,1.568-34.357,8.266-33.78,22.023  c0.576,13.758,18.051,6.692,21.778,10.741c3.26,3.544-15.279,26.229-17.353,40.634C3.757,99.089,5.077,100,9.64,100  c8.276,0,16.177-0.005,23.453-0.005c3.287,0,4.456-1.889,6.152-4.492C42.999,89.741,47.533,80.479,50,80.48  c2.466-0.001,7.001,9.261,10.755,15.022c1.696,2.604,2.864,4.492,6.151,4.492c7.275,0,15.177,0.005,23.453,0.005  c4.563,0,5.884-0.911,5.207-5.606c-2.073-14.405-20.611-37.09-17.353-40.634C81.94,49.711,99.417,56.777,99.992,43.019z" ></path></svg>',
	paper: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 20" x="0px" y="0px">' + shadow + '<path d="M18.364 6.214l-2.543-2.569s-.639-.645-1.275-.645h-8.273s-1.273 0-1.273 1.286v15.429s0 1.286 1.273 1.286h11.455c1.273 0 1.273-1.286 1.273-1.286v-12.214c0-.643-.636-1.286-.636-1.286zm-2.545 12.214h-7.636s-.636 0-.636-.643.636-.643.636-.643h7.636s.636 0 .636.643-.636.643-.636.643zm0-2.571h-7.636s-.636 0-.636-.643.636-.643.636-.643h7.636s.636 0 .636.643-.636.643-.636.643zm0-2.571h-7.636s-.636 0-.636-.643.636-.643.636-.643h7.636s.636 0 .636.643-.636.643-.636.643zm1.909-3.857h-5.091v-5.143s0-.643.636-.643.636.643.636.643v3.857h3.818s.636 0 .636.643-.636.643-.636.643z" ></path></svg>'
};