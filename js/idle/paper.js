var paperCount = 0;

var Paper = Entity.extend({
	init: function(project, type, quality) {

		this.type = "paper";
		this.paperType = type;
		this.id = paperCount++;
		this.key = this.type + this.id;
		this.project = project;
		this.sockets = {};
		this.hue = Math.random() * 360;
		this.quality = quality;
		this.createView();
		this.reroll();

	},

	setDetails: function() {

this.polish = 0;
		var node = generateWithOverrides("paper", this.project.set, {
			codeName: this.project.codeName
		});
		this.isComplete = false;
		this.progress = 0;
		var type = getRandom(types);
		this.name = node.finished;
		this.tags = this.getTagObjects(node.tags);

		this.paperSize = this.paperType.length;
		console.log(this.paperType, this.quality);


		this.updateCompleteness();
	},

	updateCompleteness: function() {

		var completenessText = "unwritten";
		if (this.progress / this.paperSize > .1)
			completenessText = "draft";
		if (this.isComplete) {
			var lvl = Math.min(Math.pow(this.polish, .3), polishText.length - 1);
			completenessText = polishText[Math.floor(lvl)];
			if (lvl === polishText.length - 1)
				lab.removeMeeplesAt(this);
		}


		if (this.completenessText !== completenessText) {
			this.completenessText = completenessText

			this.view.activity.html(this.completenessText);
			var hue = this.paperType.hue;


			this.view.paperReadiness.html(this.completenessText + " ").css({
				backgroundColor: "hsl(" + hue + ",50%, 90%)",
				color: "hsla(" + hue + ",50%, 30%, " + (.3 + .1*lvl) + ")",
			});

			if (lvl > 5) {
				this.view.paperReadiness.css({
					"font-weight": "bold"
				})
			}



			this.view.paperQuality.html(qualityToText[this.quality]).css({
				backgroundColor: "hsl(" + hue + ",50%, 90%)",
					color: "hsl(" + hue + ",50%, 30%)",
		});
			this.view.paperType.html(" " + this.paperType.name).css({
				backgroundColor: "hsl(" + hue + ",50%,90%)",
					color: "hsl(" + hue + ",50%, 30%)",
		});;

		}
	},

	setActivity: function(activity) {
		this.view.activity.html(activity);
	},



	update: function(increment) {

		this.progressBar.update(this.progress, this.tickProgress / increment);
		this.tickProgress = 0;

		if (!this.isComplete && this.progress > this.paperSize) {
			this.announce(" completed");
			this.isComplete = true;

			this.polish = Math.random() * 5;

			// Remove the progress bar and add a paper socket

			this.sockets.home = new Socket(this, {
				label: "home",
				type: "paper",
				isHomeSocket: true,
			});
			this.meeple = new Meeple(this, "");

		}

		this.updateCompleteness();

	},

	addProgress: function(amt) {
		this.tickProgress += amt;
		if (this.isComplete) {
			this.polish += amt;
		} else {
			this.progress += amt;
		}
	},


	createView: function() {
		var paper = this;
		this.view = createViewDiv(this.project.view.papers, "paper", this);

		this.makeDragDeletable();


		this.view.name = $("<div/>", {
			class: "name dataelem"
		}).appendTo(this.view.top);



		this.view.reroll = $("<button/>", {
			class: "reroll-button",
			html: "🎲"
		}).appendTo(this.view.top).click(function() {
			paper.reroll();
			event.stopPropagation();
		}).dblclick(function() {
			paper.reroll();
			event.stopPropagation();
		});

		this.view.paperDetails = $("<div/>", {
			class: "paper-details"
		}).appendTo(this.view.center);



		this.view.paperReadiness = $("<span/>", {
			class: "paper-stat"
		}).appendTo(this.view.paperDetails);

		this.view.paperQuality = $("<span/>", {
			class: "paper-stat",

		}).appendTo(this.view.paperDetails);

		this.view.paperType = $("<span/>", {
			class: "paper-stat"
		}).appendTo(this.view.paperDetails);



		this.view.tags = $("<div/>", {
			class: "tags",
		}).appendTo(this.view.bottom);
		this.view.activity = $("<div/>", {
			html: "unwritten",
			class: "activity dataelem minitext"
		}).appendTo(this.view.bottom);


		this.view.progressHolder = $("<div/>", {}).appendTo(this.view.center);



		this.sockets.write = new Socket(this, {
			label: "write",
			type: "researcher"
		});



	},
	refreshView: function() {
		console.log(this);
		this.view.progressHolder.html("");

		this.progressBar = new ProgressBar(this.view.progressHolder, "progress", this.paperSize);

		this.view.name.html(this.name);
		this.updateTagView();
	}
});