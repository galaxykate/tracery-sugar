// Paths

function getFromPath(obj, path) {
	if (!obj) {
			console.warn("No object provided for path");
		return undefined;
	}

	var obj2 = obj;
	var next;
	for (var i = 0; i < path.length; i++) {
		next = path[i];

		// Subpath: get the name of this link by following this subpath
		if (Array.isArray(next)) {
			var subpath = next;
			next = getFromPath(obj, subpath);
			if (next === undefined) {
				console.warn("No object path found for " + inSquareBrackets(subpath));
				return undefined;
			}
		}


		if (i < path.length - 1) {
			if (!obj2[next]) {
				console.warn("No address " + inQuotes(next) + " found in path " + inSquareBrackets(path));
				return undefined;
			}

			obj2 = obj2[next];
		}
	}

	if (!obj2[next]) {
		console.warn("No address " + inQuotes(next) + " found in path " + inSquareBrackets(path));
		return undefined;
	}
	var found =  obj2[next];

	return found;

}

function setFromPath(obj, path, val) {
	var obj2 = obj;
	var next;
	for (var i = 0; i < path.length; i++) {
		next = path[i];

		// Subpath: get the name of this link by following this subpath
		if (Array.isArray(next)) {
			var subpath = next;
			next = getFromPath(obj, subpath);
			if (next === undefined) {
				console.warn("No object path found for " + inSquareBrackets(subpath));
				return undefined;
			}
		}


		if (i < path.length - 1) {
			if (obj2[next] === undefined) {
				console.log("Create property " + inQuotes(next));
				obj2[next] = {};
			}
		}


		obj2 = obj2[next];

	}

	return obj2[next];
}


// JS style paths like "foo.bar[5].baz[foo]"

function parseDotPath(path) {
	var path2 = [];

	var sections = splitOnUnprotected(path, ".");
	for (var i = 0; i < sections.length; i++) {
		var s2 = splitIntoTopSections(sections[i], "[");
		path2.push(s2[0].inner);
		for (var j = 1; j < s2.length; j++) {
			if (s2[j].depth === 1) {
				var val = s2[j].inner;
				if (isNaN(parseFloat(val))) {
					var pathNext = parseDotPath(val);
					path2.push(pathNext);
				} else {
					path2.push(parseFloat(val));
				}
			}
		}
	}

	return path2;
}

function getFromDotPath(obj, path) {
	var path2 = parseDotPath(path);
	return getFromPath(obj, path2);
	console.log(path2);
}

function setFromDotPath(obj, path, val) {
	var path2 = parseDotPath(obj, path);
	setFromPath(obj, path2, val);
}

// Tracery style paths like "/foo/bar/{#foo.bar()#}/{/foo}"

function parseSlashPath(path) {

	if (path.charAt(0) === "/")
		path = path.substring(1);

	var path2 = splitOnUnprotected(path, "/").map(function(s) {
		if (s.charAt(0) === "{" && s.charAt(s.length - 1) === "}") {
			return parseSlashPath(s.substring(1, s.length - 1));
		}
		return s;
	});

	return path2;
}

function getFromSlashPath(obj, path) {
	// Expand any curly brackets
	//path = clearAutoExpansions(path);

	var path2 = parseSlashPath(path);

	return getFromPath(obj, path2);
}


function setFromSlashPath(obj, path, val) {
	var path2 = [];
}