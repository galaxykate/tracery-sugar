var publicationCount = 0;

var Publication = Entity.extend({
	init: function(day) {

		this.type = "publication";
		this.id = paperCount++;
		this.key = this.type + this.id;
		this.day = day;


		this.sockets = {};
		this.hue = Math.random() * 360;

		this.createView();
		this.reroll();

	},

	setDetails: function() {

		this.pubType = getRandom(["journal", "conference"]);
		this.quality = Math.floor(Math.pow(Math.random(), 1.7) * 4);
		var node = grammar.expand("#" + this.pubType + "#");

		this.name = node.finished;
		this.nickname = createAcronym(this.name);
		this.tags = this.getTagObjects(node.tags);


	},



	update: function(increment) {
		this.daysRemaining = this.day - lab.day;



		if (!this.isComplete) {
			this.daysRemainingView.update(this.daysRemaining);

			if (!this.pastDue && this.daysRemaining < 0) {
				console.log("DEADLINE PAST for " + this.nickname);

				var count = Math.floor(Math.random() * 10 + 5);
				if (Math.random() > .8) {
					this.announce("CFP extended " + count + " days");
					this.day = this.day + count;
				} else {
					this.pastDue = true;
					// If it contains papers, start reviewing, otherwise, remove
					var papers = lab.getPapersAt(this);
					console.log(papers);
					if (papers.length === 0) {
						this.remove();
						this.inReview = false;
						this.isComplete = true;
					} else {
						console.log("Review " + papers.length);
						// start reviewing
						this.inReview = true;
						papers.forEach(paper => paper.setActivity("in review for " + this.nickname));
						this.reviewDay = this.day + 1 + Math.random() * 2;
					}
				}
			} else {
				if (this.pastDue && this.inReview && lab.day >= this.reviewDay) {
					this.inReview = false;
					var papers = lab.getPapersAt(this);
					papers.forEach(function(paper) {
						console.log(paper.quality, paper.polish, this.quality);
					});
					console.log("review papers");
					lab.removeMeeplesAt(this);

				}
			}
		}
	},



	createView: function() {
		var paper = this;

		this.view = createViewDiv($("#calendar .content"), "paper", this);

		this.makeDragDeletable();


		this.view.name = $("<div/>", {
			class: "name dataelem"
		}).appendTo(this.view.top);

		this.view.type = $("<div/>", {
			class: "pub-type dataelem",

		}).appendTo(this.view.base);


		this.view.stats = $("<div/>", {
			class: "dataelem"
		}).appendTo(this.view.base);

		this.view.status = $("<div/>", {
			class: "activity minitext dataelem",
		}).appendTo(this.view.base);



		this.qualityView = new ValueView(this.view.stats, "quality", this.quality);
		this.daysRemainingView = new ValueView(this.view.stats, "days remaining", this.daysRemaining);

		this.view.tags = $("<div/>", {
			class: "tags",
		}).appendTo(this.view.center);


		this.sockets.review = new Socket(this, {
			label: "review",
			type: "paper"
		});
	},

	refreshView: function() {
		this.view.type.html(this.pubType);
		this.view.status.html("CFP");
		this.qualityView.update(this.quality);
		this.daysRemainingView.update(this.daysRemaining);

		this.view.name.html(this.nickname + " " + this.name);


		this.updateTagView();
	}
});