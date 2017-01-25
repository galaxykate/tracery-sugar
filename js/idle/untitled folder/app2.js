$(document).ready(function() {
	console.log("HEY");
	$(".slidersection").click(function() {
		$(".slidersection").removeClass("open");
		$(this).addClass("open");
	});


	popup(function(div) {
		div.html("You did a thing!");
	});


});


function popup(fillHtml, onClose) {


	var overlay = $("#overlay")
	overlay.show();


	function close() {
		popup.html("");
		overlay.hide();
		if (onClose)
			onClose();
	}

	var div = $("<div/>", {

	}).appendTo(overlay).click(close);

	if (fillHtml)
		fillHtml(div);
	overlay.click(close);
}