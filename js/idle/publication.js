var publicationCount = 0;

var Publication = Entity.extend({
	init: function(day, json) {

		this.type = "publication";
		this.id = paperCount++;
		this.key = this.type + this.id;
		this.day = {
			review: day + Math.random() * 20 + 20,
			deadline: day
		};


		this.sockets = {};
		this.hue = Math.random() * 360;

		this.createView();
		this.reroll();

	},

	loadFromJSON: function(json) {
		var values = ["hue", "name", "day"];
		values.forEach(key => this[key] = json[key]);

		if (json.tags)
			this.tags = json.tags.map(key => skillsByKey[key]);

		this.refreshView();
		this.updateSkillView();
	},

	toJSON: function() {
		var values = ["hue", "name", "day"];
		var json = {
			tags: this.map(tag => tag.key)
		};
		values.forEach(key => json[key] = this[key]);

		return json;
	},

	setDetails: function() {

		this.mode = "deadline";
		this.pubType = getRandom(["journal", "conference"]);
		this.quality = Math.floor(Math.pow(Math.random(), 1.3) * 4);
		var node = grammar.expand("#" + this.pubType + "#");

		this.name = node.finished;
		this.nickname = createAcronym(this.name);
		this.tags = this.getTagObjects(node.tags);


		this.tags.push(getRandom(skills.nonMeta));
		this.tags.push(getRandom(skills.nonMeta));
		this.tags.push(getRandom(skills.nonMeta));
	},


	canAccept: function(paper) {
		if (lab.day < this.day.deadline) {
			if (this.pubType === "journal") {
				return paper.paperType === "journal"
			}
			return paper.paperType !== "journal" && paper.paperType !== "monograph"
		}
	},


	// Get the average score from -2 to 2
	score: function(paper) {


		var qualityDiff = paper.quality - this.quality;
		var score = qualityDiff - .5 + .3 * paper.level;

		return score;
	},

	getReviews: function(paper) {
		var reviewText = ["strong reject", "reject", "borderline", "accept", "strong accept"];
		var reviewSymbol = ["reject1", "reject0", "borderline", "accept0", "accept1"];
		var reviews = {
			reviews: [],
		};
		var tagOverlap = getTagOverlap(this.tags, paper.tags);
		var score = this.score(paper) + .8 * Math.pow(tagOverlap.length, 1.5);
		var total = 0;
		for (var i = 0; i < 3; i++) {
			var s = Math.min(2, Math.max(-2, score + (Math.random() - .5) * (Math.pow(Math.random() * 4, 1))));
			var lvl = Math.round(s + 2);
			var review = {
				score: s,
				title: reviewText[lvl],
				text: grammar.flatten("#" + reviewSymbol[lvl] + "#"),
			};
			reviews.reviews.push(review);
			total += s;
		}

		reviews.score = total / 3;
		return reviews;
	},

	update: function(increment) {
		this.daysRemaining = this.day[this.mode] - lab.day;
		var prefix = "Call for papers, days remaining: ";
		if (this.mode === "review")
			prefix = "In review, days remaining: ";
		this.daysRemainingView.html(prefix + " " + Math.ceil(this.daysRemaining));


		//	console.log(this.nickname + " " + this.daysRemaining);
		if (this.daysRemaining <= 0) {
			var papers = lab.getPapersAt(this);
			switch (this.mode) {
				case "deadline":
					var count = papers.length + " papers";
					if (papers.length === 1)
						count = papers.length + " paper";
					this.announce(" submission deadline, " + count + " submitted");
					this.mode = "review";
					break;
				case "review":

					for (var i = 0; i < papers.length; i++) {
						// generate reviews
						var reviews = this.getReviews(papers[i]);
						console.log(reviews);
						if (reviews.score > 0) {
							papers[i].announce(" <b>ACCEPTED</b> to " + this.name);
							papers[i].publish(this);

						} else {
							papers[i].announce(" <b>REJECTED</b> from " + this.name);
						}

						for (var j = 0; j < reviews.reviews.length; j++) {
							papers[i].announce("&nbsp&nbsp&nbsp&nbsp<b>" + inQuotes(reviews.reviews[j].title + ":</b> " + reviews.reviews[j].text), true);
						}
						lab.removeMeeplesAt(this);

					}
					this.remove();
					break;
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


		this.qualityView = new ValueView(this.view.stats, "quality", false);
		this.daysRemainingView = $("<div/>", {
			class: "minitext dataelem",
		}).appendTo(this.view.stats);

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
		this.updateTagView();

		this.view.name.html(this.nickname + " " + this.name);


		this.updateTagView();
	},

	detailsToString: function() {
		return this.nickname + inParens(this.pubType.charAt(0)) + " " + this.quality + " " + this.tags.map(tag => tag.key);
	}
});


function getTagOverlap(tags0, tags1) {
	var tags = {};
	tags0.forEach(tag => tags[tag.key] ? tags[tag.key]++ : tags[tag.key] = 1);
	tags1.forEach(tag => tags[tag.key] ? tags[tag.key]++ : tags[tag.key] = 1);


	var overlap = Object.keys(tags).filter(key => tags[key] >= 2);
	return overlap;
}