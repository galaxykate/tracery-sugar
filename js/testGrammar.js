var testGrammar = {

	//"origin": ["#test.replace(#test3#,(#fartEmoji#)\\#fartEmoji\\#)#"],
	"origin": ["[test:(#emoji#)]#test##test##test#"],
	"origin": ["#test#"],
	//"origin2": ["[test:#emoji#]#test##test##test#"],
	"emoji": ["🍄", "🌍", "🌟", "⛄️", "❄️", "🎄", "❤️", "🍷", "🍺"],
	"fartEmoji": ["#emoji#💨"],
	//"origin": ["#/{#option#}Name.foo.bar#"],
	"option": ["foo"],
	"foo": "getting there..",
	"test": "#test3.foo##test2.foo#",
	"test3": "test",
	"test2": "WINNER IS TRACERY!",
	// expand capitalize immediately, but dont expand animal
	// result: mcNick:["the Great", "the Blue #animal#",]
	"story": ["[mcPersonality:proud][mcNicknames:[the #adj.capitalize#, the #mcColor.color# (#animal#)]], "],

	"minutes": ["#.randomInt(5)##.randomInt(9)#"],

	"timeOfDay": ["0#.randomInt(9)#:#minutes#", "1#.randomInt(9)##minutes#", "2#.randomInt(4)#:#minutes#"],

	"setTime": "[myDate:#date#][startTime:#timeOfDay#][totalHours:#.randomInt(5).plus(1)#][endTime:#myTime.addHours(hourCount)#]",

	"timeJump": "[myEra:#era#]You open the door of the time machine, which reads #date# #myTime#.  The time machine will disappear at #endTime# #eraDescription# #timeDescription#.",

	"timeDescription": {
		"conditionRules": {
			"<inside>": "You are inside, and don't know the time",
			"default": {
				"betweenTime(#startTime#,0:00,5:00)": "The darkness of night.",
				"betweenTime(#startTime#,5:00,7:00)": "A brilliant dawn.",
				"betweenTime(#startTime#,7:00,18:00)": "A sunny day.",
				"betweenTime(#startTime#,18:00,20:00)": "The suns sinks below the horizon.",
				"afterTime(#startTime#,20:00)": "The darkness of night.",
			}
		},
		"rules": ["You look at your hands"]
	},

	"activity": "You sit and watch. [myTime:myTime.addHours(1)]It is now #myTime#. #timeDescription#",

	"eraDescription": {
		"switchOn": "#myEra#",
		"switchCases": {
			"future": ["A sleekly-jumpsuited person with rocket shoes flies past you", "Hundreds of spaceships hover above you"],
			"roman": ["Senators in togas walk past.", "A roman centurion marches past"],
			"medieval": ["Lords and ladies walk into a castle nearby.", "A peasant woman shovels mud in a field"],
			"jurassic": ["A dinosaur stomps past you.", "Giant dragonflies swarm past you"],
			"DEFAULT": ["Nothing but stars"],
		}
	},

	

	"date": {
		"switchOn": "#myEra#",
		"switchCases": {
			"future": "#.randomInt(3000).plus(2100)#",
			"roman": ["#.randomInt(200)# BC", "#.randomInt(200)# AD"],
			"medieval": ["#.randomInt(200).add(1100)# AD"],
			"jurassic": ["#.randomInt(10)# million years BC"],
			"DEFAULT": ["BZZXXXYTT::: --ERRRORRRR--"]
		}
	},

}