var panelCount = 0;
var Panel = Class.extend({
	init: function(id, holder, startPos) {
		var panel = this;
		this.idNumber = panelCount++;


		this.id = "panel-" + id;

		this.div = $("<div/>", {
			class: "panel",
			id: this.id,
		}).appendTo(holder);
		this.div.css({
			position: "absolute"
		})

		this.header = $("<div/>", {
			class: "panel-header",
			html: id
		}).appendTo(this.div);

		this.content = $("<div/>", {
			class: "panel-content",
		}).appendTo(this.div);

		this.div.draggable({
			handle: ".panel-header",
			stop: function(ev, ui) {
				console.log(ui);
				panel.x = ui.position.left;
				panel.y = ui.position.top;
				panel.savePosition();
			}
		});

		this.div.resizable({
			stop: function() {
				panel.w = panel.div.width();
				panel.h = panel.div.height();
				panel.savePosition();
			}
		});

		var savedPos = localStorage.getItem(this.id);
		if (savedPos)
			startPos = JSON.parse(savedPos);

		if (!startPos) {
			this.setPosition(this.idNumber * 120, this.idNumber * 20);
		} else {
			this.setPosition(startPos.x, startPos.y, startPos.w, startPos.h);
		}
	},


	setPosition: function(x, y, w, h) {
		this.div.css({
			left: x,
			top: y
		});

		this.x = x;
		this.y = y;

		if (w !== undefined) {
			this.div.css({
				width: w,
				height: h
			});
			this.w = w;
			this.h = h;
		}

		// Save pos

		this.savePosition();
	},

	savePosition: function() {
		localStorage.setItem(this.id, JSON.stringify({
			x: this.x,
			y: this.y,
			w: this.w,
			h: this.h
		}));
	}

});