// Moveable meeples

var Meeple = Class.extend({
	init: function(type, label, object) {
		this.type = type;
		this.label = label;
		this.object = object;
		this.currentSocket;

	},

	createDiv: function(holder) {
		var div = $("meeple")
	},

	setHome: function(socket) {
		this.moveTo(socket);
		this.home = socket;
	},

	moveTo: function(socket) {
		socket.meeples.push(this);
	},

	reset: function() {
		this.moveTo(this.home);
	}
});


// Expandable, max sockets
var Socket = Class.extend({
	init: function() {
		this.meeples = [];
	},

	remove: function() {

	},
	removeAll: function() {
		$.each(this.meeples, function(index, meeple) {
			meeple.reset();
		});
	}
});