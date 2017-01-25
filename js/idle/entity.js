var Entity = Class.extend({
	select: function() {
		if (selected) {
			selected.deselect();
		}
		this.isSelected = true;
		selected = this;
	},

	announce: function(announcement, noPrefix) {
		console.log(this.name + announcement);

		var s = "<div class='announcement'>" + toSpan(this) + announcement + "</div>";
		if (noPrefix)
			s = "<div class='announcement'>" + announcement + "</div>";
		if (this.view.announcements) {
			this.view.announcements.append(s);
		} else {
			lab.view.announcements.append(s);
		}
	},

	remove: function() {
		this.view.slideUp();
		this.isDeleted = true;
	},

	deselect: function() {
		this.isSelected = false;
		selected = undefined;
	},


	toggleSelect: function() {
		if (!this.isSelected) {
			this.select();
		} else this.deselect();
	},

	reroll: function() {
		this.setDetails();

		this.refreshView();
	},

	reset: function() {
		// return to the home socket
		if (this.meeple)
			this.meeple.moveTo();
	},

	getTagsFromSet: function() {
		this.tags = types.map(type => this.set[type]).filter(s => s !== undefined);
	},

	getTagObjects: function(keys) {
		return keys.map(function(key) {
			if (!skillsByKey[key]) {
				console.warn("missing skill", key);

			}
			return skillsByKey[key];
		});
	},

	updateTagView: function() {

		// update tag view
		var obj = this;
		this.view.tags.html("");
		$.each(this.tags, function(index, tag) {
			var tagDiv = $("<div/>", {
				html: tag.name,
				class: "tag" + " tag-" + tag.key + " tag-" + tag.type,
			}).appendTo(obj.view.tags).click(function() {

				selectTagGroup(tag.key);
				event.stopPropagation();
			});
		});
	},



	makeDragDeletable: function() {
		var obj = this;
		var limit = 350;

		this.view.draggable({
			axis: "x",
			containment: [-limit, 0, limit, 0],
			drag: function() {
				var xPos = $(this).offset().left;
				if (Math.abs(xPos > limit * .6)) {
					$(this).addClass("toDelete");
				} else
					$(this).removeClass("toDelete");

			},
			stop: function() {

				var xPos = $(this).offset().left;
				console.log(xPos);
				if (Math.abs(xPos > limit * .6)) {
					$(this).addClass("toDelete");
					obj.view.animate({
						left: 1000,
					}, .3);

					obj.view.slideUp();

					//obj.view.remove();
					obj.isDeleted = true;
				} else {
					$(this).removeClass("toDelete");
					// reset
					$(this).animate({
						left: 0
					}, 120);
				}



				//get offset
			}
		})

	}


});



function createViewDiv(holder, type, obj, leftSockets) {
	var view = $("<div/>", {
		class: "entity card " + type + " " + obj.key
	}).appendTo(holder).click(function() {
		/*
		$("." + type).removeClass("selected");
		$(this).addClass("selected");
		obj.toggleSelect();
		*/
	});

	view.main = $("<div/>", {
		class: "main"
	}).appendTo(view);

	view.base = $("<div/>", {
		class: "base"
	}).appendTo(view);

	view.dataHolder = $("<div/>", {
		class: "data"
	}).appendTo(view.main);

	view.top = $("<div/>", {
		class: "top dataline"
	}).appendTo(view.dataHolder);


	view.center = $("<div/>", {
		class: "center dataline"
	}).appendTo(view.dataHolder);

	view.bottom = $("<div/>", {
		class: "bottom dataline"
	}).appendTo(view.dataHolder);

	if (leftSockets)
		view.socketHolder = $("<div/>", {
			class: "socket-column"
		}).prependTo(view.main);
	else
		view.socketHolder = $("<div/>", {
			class: "socket-column"
		}).appendTo(view.main);

	return view;
}

function generateWithOverrides(query, set, extraOverrides) {
	var overrides = $.extend({}, extraOverrides);

	if (set) {
		for (var i = 0; i < types.length; i++) {

			var type = types[i];
			var val = set[type];
			if (val) {

				if (type === "focus")
					overrides.focusPlural = val.plural;
				overrides[type] = val.name;
			}
		}
	}
	var node = grammar.expandWithOverrides("#" + query + "#", overrides,
		true);

	return node;
}