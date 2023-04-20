const canvas = document.getElementById("pizzagame");
const render = canvas.getContext("2d");


// Game variables
let highscore = 0;
let score = 0;
let wordsperorder = 1;					// How many words in an order.
let successcount = 0;					// How many successful orders have been made by the player.
const LEVELUPTHRESHOLD = 5;				// How many successful orders must be made before the game adds more words to order.
const NORMALSCOREVALUE = 10;
const EXTRALIFESCORE = 300;				// What score the player needs to get to earn an extra life.

let framestarttime = Date.now();
let lastframetime = Date.now();
let orderendtime = Date.now();
let deltatime = 0;
const STANDARDORDERTIME = 12000;		// Amount of time player has to type order.

let lives = 3;

let state = 0;


const completeingredientarray = [];

const incompleteingredientarray = [];

const toppingarray = [];	// Should contain objects like this {graphic: '', x:0, y:0}

// List of words.
const wordlist = [
	{ "word": "pepperoni", "graphic": "pepperoni.png" },
	{ "word": "mozzarella", "graphic": "mozzarella.png" },
	{ "word": "bell pepper", "graphic": "bellpepper.png" },
	{ "word": "tomato", "graphic": "tomato.png" },
	{ "word": "olive", "graphic": "olive.png" },
	{ "word": "sausage", "graphic": "sausage.png" },
	{ "word": "chicken", "graphic": "chicken.png" },
	{ "word": "pineapple", "graphic": "pineapple.png" },
	{ "word": "bacon", "graphic": "bacon.png" },
	{ "word": "onions", "graphic": "onions.png" },
	{ "word": "anchovies", "graphic": "anchovies.png" },
	{ "word": "jalapeno", "graphic": "jalapeno.png" },
	{ "word": "ham", "graphic": "ham.png" },
	{ "word": "car", "graphic": "car.png" },
	{ "word": "crowbar", "graphic": "crowbar.png" },
	{ "word": "beans", "graphic": "beans.png" },
	{ "word": "alfredo", "graphic": "alfredo.png" },
	{ "word": "pickle", "graphic": "pickle.png" },
	{ "word": "mayonnaise", "graphic": "mayo.png" },
	{ "word": "ranch", "graphic": "ranch.png" },
	{ "word": "buffalo", "graphic": "buffalo.png" },
	{ "word": "macaroni", "graphic": "macaroni.png" },
	{ "word": "grape", "graphic": "grape.png" },
	{ "word": "pizza", "graphic": "pizza.png" },
	{ "word": "bleu cheese", "graphic": "bleu.png" },
	{ "word": "apple", "graphic": "apple.png" },
	{ "word": "pear", "graphic": "pear.png" },
	{ "word": "garlic", "graphic": "garlic.png" },
	{ "word": "basil", "graphic": "basil.png" },
	{ "word": "tofu", "graphic": "tofu.png" },
	{ "word": "pesto", "graphic": "pesto.png" }
];

const WORDLISTLENGTH = wordlist.length;

// Order text
let orderlinegreen =
	["",
		"",
		"",
		"",
		"",
		"",
		""];
let orderlinered =
	["",
		"",
		"",
		"",
		"",
		"",
		""];
let orderlineblack =
	["",
		"",
		"",
		"",
		"",
		"",
		""];


// Enumerations for the state machine.
const LOADING = 0;
const TITLE = 1;
const CREATEPIZZA = 2;
const TYPING = 3;
const SUCCESS = 5;
const FAIL = 7;
const BEFORECREATEPIZZA = 8;
const GAMEOVER = 9;
const BEFORETYPING = 10;

/*
// Sounds
const dingSound = "sounds/orderbell.mp3";
const failSound = "sounds/no.mp3";
const successSound = "sounds/success.mp3";
const clickSound = "sounds/click.mp3";
const tooSlowSound = "sounds/tooslow.mp3";
const extraLifeSound = "sounds/extralife.mp3";
*/

volume = 10;

// Graphics

const defaultpizzax = 400;
const defaultpizzay = 200;

const toppingpositionsx = [250, 375, 250, 375, 350];
const toppingpositionsy = [75, 75, 175, 175, 150];

let pizzax = 0;
let pizzay = 0;

window.requestAnimationFrame(drawgame);
const srcarray = [
	"check.png", "x.png", "dummy.png", "beans.png", "chicken.png", "ham.png", "macaroni.png",
	"mayo.png", "onions.png", "pepperoni.png", "tomato.png", "alfredo.png", "anchovies.png",
	"car.png", "grape.png", "mozzarella.png", "olive.png", "pineapple.png", "ranch.png",
	"bacon.png", "bellpepper.png", "buffalo.png", "crowbar.png", "jalapeno.png", "pickle.png",
	"sausage.png", "pizza.png", "bleu.png", "apple.png", "pear.png", "garlic.png", "basil.png",
	"tofu.png", "pesto.png", "crust.png"
]
let imagestoload = srcarray.length;		// This integer will be used to check if every graphic has been loaded before launching the game.

let graphicdict = new Map();


function populategraphicmap() {
	srcarray.forEach((element) => {
		let newimage = new Image();

		newimage.onload = function () {
			imagestoload -= 1;
			if (imagestoload <= 0) {
				state = TITLE;
				filltextlists();
			}
		}

		newimage.src = "pizzagraphic/" + element;

		graphicdict.set(element, newimage);
	})
}


function createAudioMap(fileNames) {
	const finalMap = new Map();

	for (file of fileNames) {
		const audio = new Audio("sounds/" + file);
		finalMap.set(file, audio);
	}

	return finalMap;
}


function drawgame() {
	// Timing
	lastframetime = framestarttime;
	framestarttime = Date.now();
	deltatime = (framestarttime - lastframetime) / 1000;

	switch (state) {

		case LOADING:
			render.clearRect(0, 0, 800, 600);
			drawloadscreen();
			break;
		case TITLE:
			// Logic is in keyboard event handler.

			render.clearRect(0, 0, 800, 600);
			drawbackground();
			drawtitle();
			drawscore();
			drawSoundVolume();
			break;
		case BEFORETYPING:
			filltextlists();
			playsound("orderbell.mp3");
			state = TYPING;

			render.clearRect(0, 0, 800, 600);
			drawbackground();
			drawcrust(defaultpizzax, defaultpizzay);
			draworder();
			drawtimer();
			drawlives();
			drawscore();
			drawSoundVolume();
			break;
		case TYPING:
			// Game logic is in keyboard event handler towards bottom of file.

			if (framestarttime > orderendtime) {
				faillogic("tooslow.mp3");
			}

			render.clearRect(0, 0, 800, 600);
			drawbackground();
			drawcrust(defaultpizzax, defaultpizzay);
			drawtoppings();
			draworder();
			drawtimer();
			drawlives();
			drawscore();
			drawSoundVolume();
			break;
		case SUCCESS:
			pizzax += 800 * deltatime;

			if (pizzax > 800) {
				state = BEFORECREATEPIZZA;
			}

			render.clearRect(0, 0, 800, 600);
			drawbackground();
			drawcrust(defaultpizzax + pizzax, defaultpizzay);
			drawtoppings();
			drawlives();
			drawscore()
			drawSoundVolume();
			break;
		case BEFORECREATEPIZZA:
			pizzax = -800;

			if (lives > 0) {
				orderendtime = framestarttime + STANDARDORDERTIME;
				generateorder();
				pizzay = 0;
				state = CREATEPIZZA;
			} else {
				orderendtime = framestarttime + 5000;
				state = GAMEOVER
			}

			render.clearRect(0, 0, 800, 600);
			drawbackground();
			drawlives();
			drawscore();
			drawSoundVolume()
			break;
		case CREATEPIZZA:
			pizzax += 800 * deltatime;

			if (pizzax >= 0) {
				pizzax = 0;
				state = BEFORETYPING;
			}

			render.clearRect(0, 0, 800, 600);
			drawbackground();
			drawlives();
			drawcrust(defaultpizzax + pizzax, defaultpizzay);
			drawscore();
			drawSoundVolume();
			break;
		case FAIL:
			pizzay -= 1600 * deltatime;

			if (pizzay < -1000) {
				state = BEFORECREATEPIZZA
			}

			render.clearRect(0, 0, 800, 600);
			drawbackground();
			drawlives();
			drawcrust(defaultpizzax, defaultpizzay + pizzay)
			drawtoppings();
			draworder();
			drawscore();
			drawSoundVolume();
			break;
		case GAMEOVER:
			if (framestarttime > orderendtime) {
				state = TITLE;
			}

			render.clearRect(0, 0, 800, 600);
			drawbackground();
			drawgameover();
			break;
	}
	requestAnimationFrame(drawgame);
}


function drawSoundVolume() {
	render.font = "24px serif";
	render.fillStyle = "black";
	render.fillText("Sound volume : " + volume, 15, 580);
}


function drawloadscreen() {
	render.beginPath();
	render.rect(0, 0, 800, 600);
	render.fillStyle = "black";
	render.fill();
	render.closePath();

	render.font = "60px serif";
	render.fillStyle = "white";
	render.fillText("Loading...", 100, 100);
}


function drawbackground() {
	// Counter
	render.beginPath();
	render.rect(0, 0, 800, 400);
	render.fillStyle = "silver";
	render.fill();
	render.closePath();

	// Paper
	render.beginPath();
	render.rect(0, 400, 800, 200);
	render.fillStyle = "beige";
	render.fill();
	render.closePath();
}


function drawcrust(x, y) {
	render.drawImage(graphicdict.get("crust.png"), x - 175, y - 175);
}


function draworder() {
	const BEGINLINE = 10;
	let textstart = BEGINLINE;

	for (let i = 0; i < 7; i++) {
		render.font = "20px courier";
		render.fillStyle = "green";
		render.fillText(orderlinegreen[i], 10, 430 + (24 * i));
		measure = render.measureText(orderlinegreen[i]);
		textstart += measure.width;
		render.fillStyle = "red";
		render.fillText(orderlinered[i], textstart, 430 + (24 * i));
		measure = render.measureText(orderlinered[i]);
		textstart += measure.width;
		render.fillStyle = "black";
		render.fillText(orderlineblack[i], textstart, 430 + (24 * i));
		textstart = BEGINLINE;
	}

}

function drawgameover() {
	render.font = "60px serif";
	render.fillStyle = "black";
	render.fillText("Game over", 150, 200);
}


function drawtimer() {
	render.font = "24px serif";
	render.fillStyle = "black";
	render.fillText("Time :" + Math.floor((orderendtime - framestarttime) / 1000), 675, 30);
}


function drawlives() {
	let lifecounter = lives;		// This counts the amount of lives the player has in the for loop so the program knows whether to draw an x or check.
	let currentgraphic = graphicdict.get("check.png")
	for (let i = 0; i <= 2; i++) {
		if (lifecounter <= 0) {
			currentgraphic = graphicdict.get("x.png");
		}
		render.drawImage(currentgraphic, 675 + (i * 32), 40);
		lifecounter -= 1;
	}
}


function drawscore() {
	render.font = "24px serif";
	render.fillStyle = "black";
	render.fillText("Score: " + score, 25, 30);
	render.fillText("High score: " + highscore, 25, 55);
}


function droptoppings(graphic) {
	// Put 5 toppings at random spots on pizza.
	for (let i = 4; i >= 0; i--) {
		newX = Math.random() * 150 + toppingpositionsx[i];
		newY = Math.random() * 150 + toppingpositionsy[i];
		newR = Math.random() * 6.28;

		toppingarray.push(
			{
				"graphic": graphic,
				"x": newX,
				"y": newY,
				"r": newR
			});
	}
}


function drawtoppings() {
	// Go through array of toppings, and draw each of them
	// with a modifier for pizza position.

	for (let i = 0; i < toppingarray.length; i++) {
		render.save();
		render.translate(toppingarray[i].x + pizzax, toppingarray[i].y + pizzay);
		render.rotate(toppingarray[i].r);
		render.drawImage(graphicdict.get(toppingarray[i].graphic), -50, -50);
		render.restore();
	}
}


function cleartextgraphics() {
	orderlinegreen = ["", "", "", "", "", "", ""];
	orderlinered = ["", "", "", "", "", "", ""];
	orderlineblack = ["", "", "", "", "", "", ""];
}

function filltextlists() {
	let currentline = 0;
	let wordnumber = 0;

	// Erase all graphic text lists.
	cleartextgraphics();

	function addwordnumber() {
		wordnumber += 1;

		if (wordnumber > 9) {
			wordnumber = 0;
			currentline += 1;
		}
	}

	for (i = 0; i < completeingredientarray.length; i++) {			// Counting all completed words.
		orderlinegreen[currentline] += completeingredientarray[i];
		addwordnumber();
	}
	if (incompleteingredientarray.length > 0) {
		for (i = 0; i < incompleteingredientarray[0].word.length; i++) {	// Building the first word
			if (i < incompleteingredientarray[0].currentletter) {									// Already typed letters.
				orderlinegreen[currentline] += (incompleteingredientarray[0].word.charAt(i));
			}
			else if (i == incompleteingredientarray[0].currentletter) {							// Current letter to type.
				orderlinered[currentline] += (incompleteingredientarray[0].word.charAt(i));
			}
			else {																				// Letters that haven't been typed yet.
				orderlineblack[currentline] += (incompleteingredientarray[0].word.charAt(i));
			}
		}
	}

	addwordnumber();

	for (i = 1; i < incompleteingredientarray.length; i++) {									// Counting all words that haven't been typed.
		orderlineblack[currentline] += (incompleteingredientarray[i].word);
		addwordnumber();
	}
}

function drawtitle() {
	render.font = "80px serif";
	render.fillStyle = "black";
	render.fillText("Pizza Typer", 150, 200);
	render.font = "20px courier";
	render.fillText("Press space to play", 150, 425);
	render.fillText("Press up and down arrows to change volume", 25, 550);
}

function playsound(sound) {
	let playedsound = document.createElement("audio");
	playedsound.src = audioMap.get(sound).src;
	playedsound.volume = volume / 10;
	document.body.appendChild(playedsound);
	playedsound.play();

	playedsound.onended = function () {
		this.parentNode.removeChild(playedsound);
	}
}

// Input.

document.addEventListener("keydown", (event) => {
	switch (state) {
		case TYPING:
			if (event.key === incompleteingredientarray[0].word.charAt(incompleteingredientarray[0].currentletter)) {	// Player has typed highlighted letter.
				incompleteingredientarray[0].currentletter += 1;
				playsound("click.mp3");

				if (incompleteingredientarray[0].currentletter == incompleteingredientarray[0].word.length)				// Player has completed a word.
				{
					completeWordLogic();
				}

				if (incompleteingredientarray.length == 0) {																// Player has completed order.
					successlogic();
				}
				filltextlists();
			} else if (event.key === "Control" || event.key === "Alt" || event.key === "Tab" || event.key === "Shift"
				|| event.key === "ArrowUp" || event.key === "ArrowDown") { 						// Exclude other inputs like tab, control, and alt so player does not lose score.
				// Do nothing.
			} else {								// Player fails at typing highlighted letter.
				faillogic("no.mp3");
			}
			break;
		case TITLE:
			if (event.key === " ") {
				startgame();
			}
			break;
	}

	if (event.key === "ArrowUp") {
		volume < 10 ? volume += 1 : volume = 10;
		playsound("click.mp3");
	} else if (event.key === "ArrowDown") {
		volume > 0 ? volume -= 1 : volume = 0;
		playsound("click.mp3");
	}

	if ((event.key === " " || event.key === "ArrowDown" || event.key === "ArrowUp") && event.target === document.body) {		// Prevents page from scrolling down when player presses spacebar. 
		event.preventDefault();
	}
})

// Game logic

function generateorder() {
	let remainingwords = wordsperorder;
	incompleteingredientarray.splice(0, incompleteingredientarray.length);
	toppingarray.splice(0, toppingarray.length);

	// Pick random word from list, reduce remainingwords by 1, and capitalizes first word.
	let randomnumber = Math.floor(Math.random() * WORDLISTLENGTH);

	// Getting word.
	let newword = wordlist[randomnumber]["word"];

	// Captialization.
	const firstletter = newword.charAt(0).toUpperCase();
	const restofword = newword.slice(1);

	incompleteingredientarray.push({
		"word": firstletter + restofword, "currentletter": 0,
		"graphic": wordlist[randomnumber].graphic, "score": NORMALSCOREVALUE
	});

	remainingwords--;

	while (remainingwords > 0) {		// Add rest of words.
		// Add comma first.
		incompleteingredientarray.push({ "word": ", ", "currentletter": 0, "graphic": "", "score": 0 });

		// Add word.
		randomnumber = Math.floor(Math.random() * WORDLISTLENGTH);
		incompleteingredientarray.push({
			"word": wordlist[randomnumber].word, "currentletter": 0,
			"graphic": wordlist[randomnumber].graphic, "score": NORMALSCOREVALUE
		});
		remainingwords--;
	}
}

function successlogic() {
	// Add success, and erase ingredient array.
	state = SUCCESS;
	successcount++;
	completeingredientarray.splice(0, completeingredientarray.length);
	playsound("success.mp3");

	if (successcount >= LEVELUPTHRESHOLD) {
		// Add extra word for every order, then reset the counter.
		wordsperorder++;
		successcount = 0;
	}
}

function faillogic(sound) {		// Has sound parameter to allow more then one sound.
	// Erase list, and subtract life.
	state = FAIL;
	completeingredientarray.splice(0, completeingredientarray.length);
	lives--;
	playsound(sound);
}

function startgame() {
	state = BEFORECREATEPIZZA;
	score = 0;
	lives = 3;
	successcount = 0;
	wordsperorder = 1;
}

function sethighscore() {
	if (score > highscore) {
		highscore = score;
	}
}

function extraLife() {
	// Checks if the player has earned a certain amount of points. If so, then check if the player has less than three lives. If so, give extra life.
	if (score % EXTRALIFESCORE === 0 && lives < 3) {
		lives++;
		playsound("extralife.mp3");
	}
}


function completeWordLogic() {
	removedword = incompleteingredientarray.shift();
	completeingredientarray.push(removedword.word);
	score += removedword.score;
	sethighscore();
	if (removedword.graphic !== "") {		// Check if word is not a comma.
		droptoppings(removedword.graphic);
		extraLife();						// extraLife is here because otherwise you would get extra lives from commas.
	}
}

// Game start
populategraphicmap();
const audioMap = createAudioMap(["click.mp3", "extralife.mp3", "no.mp3", "orderbell.mp3", "success.mp3", "tooslow.mp3"]);
filltextlists();
srcarray.splice(0, srcarray.length);		// Erase unused by this point array to save memory.
