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

const completeingredientarray = [];		// Array of strings
const incompleteingredientarray = [];	// Array of objects.

const toppingarray = [];	// Should contain objects like this {graphic: '', x:0, y:0}

let clicked = false;

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


// Enumerations for the state machine.
const LOADING = 0;
const TITLE = 1;
const CREATEPIZZA = 2;
const TYPING = 3;
const CLICKTOPLAY = 4;
const SUCCESS = 5;
const FAIL = 7;
const BEFORECREATEPIZZA = 8;
const GAMEOVER = 9;
const BEFORETYPING = 10;

let state = LOADING;

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
				state = CLICKTOPLAY;
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
			playsound("orderbell.mp3");
			state = TYPING;

			render.clearRect(0, 0, 800, 600);
			drawbackground();
			drawcrust(defaultpizzax, defaultpizzay);
			newDrawText(newDrawOrderListGenerator(), incompleteingredientarray[0].currentLetter, incompleteingredientarray[0].word.length)
			drawtimer();
			drawlives();
			drawscore();
			drawSoundVolume();
			break;
		case CLICKTOPLAY:
			render.clearRect(0, 0, 800, 600);
			drawclickscreen();

			if (clicked === true) {
				state = TITLE;
			}
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
			newDrawText(newDrawOrderListGenerator(), incompleteingredientarray[0].currentLetter, incompleteingredientarray[0].word.length)
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
			newDrawText(newDrawOrderListGenerator(), incompleteingredientarray[0].currentLetter, incompleteingredientarray[0].word.length)
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


function drawclickscreen() {
	render.beginPath();
	render.rect(0, 0, 800, 600);
	render.fillStyle = "black";
	render.fill();
	render.closePath();

	render.font = "60px serif";
	render.fillStyle = "white";
	render.fillText("Click to start", 100, 100);
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


function newDrawOrderListGenerator() {
	// Create string of completed items.
	let completeWords = [];
	let currentString = '';
	let incompleteWords = [];

	// Go through complete words
	for (let word of completeingredientarray) {
		// Go through every word that has been totally complete.
		completeWords.push(word);
	}

	// Go through incomplete words.
	for (let i = 0; i < incompleteingredientarray.length; i++) {
		// It is the first word of the array. It needs the red letter.

		if (i === 0) {
			// Already typed letters.
			completeWords.push(incompleteingredientarray[i].word.slice(0, incompleteingredientarray[i].currentletter));

			// Current character.
			currentString = incompleteingredientarray[i].word.charAt(incompleteingredientarray[i].currentletter);

			// Rest of word.
			incompleteWords.push(incompleteingredientarray[i].word.slice(incompleteingredientarray[i].currentletter + 1, incompleteingredientarray[i].word.length));
		} else {
			// Word has not been gotten to.
			incompleteWords.push(incompleteingredientarray[i].word);
		}
	}

	// Return an object containing every word.
	return { completeWords: completeWords, currentLetter: currentString, incompleteWords: incompleteWords };
}


function newDrawText(textObject, currentWordLetter, currentWordLength) {
	let horizontalWordCount = 0;	// Declare how many words there are per line.
	let line = 0;					// Declare line that order is on.
	let startX = 0;					// Where the next word will start x wise.

	// Set up render
	render.font = "20px courier";

	// Set render for complete words.
	render.fillStyle = "green";

	// Draw totally complete words
	for (let i = 0; i < textObject.completeWords.length - 1; i++) {
		const item = textObject.completeWords[i];
		// Draw green text
		render.fillText(item, 10 + startX, 430 + (24 * line));

		// Check if horizontalWordCount is over 7. This is to keep the order from going off the page.
		horizontalWordCount++;

		if (horizontalWordCount > 7) {
			// Starting new line.
			startX = 0;
			line++;
			horizontalWordCount = 0;
		} else {
			// Staying on current line.
			startX += render.measureText(item).width;
		}
	}

	// Draw current word.

	// Check if there are any letters to turn green.
	if (textObject.completeWords.length > 0) {
		// There are green letter in current word.
		render.fillText(textObject.completeWords[textObject.completeWords.length - 1], 10 + startX, 430 + (24 * line));
		startX += render.measureText(textObject.completeWords[textObject.completeWords.length - 1]).width;
	}
	// Set render to draw red text.
	render.fillStyle = "red";

	// Draw red letter.
	render.fillText(textObject.currentLetter, 10 + startX, 430 + (24 * line));
	startX += render.measureText(textObject.currentLetter).width;

	// Set render to draw black text.
	render.fillStyle = "black";

	// Draw black letters if there are any for first word.
	if (currentWordLetter < currentWordLength - 1) {
		// There are black letters to draw in first word.
		render.fillText(textObject.incompleteWords[0], 10 + startX, 430 + (24 * line));
		startX += render.measureText(textObject.incompleteWords[0]).width;
	}

	// Check if new line is needed.
	horizontalWordCount++;
	if (horizontalWordCount > 7) {
		// Starting new line.
		startX = 0;
		line++;
		horizontalWordCount = 0;
	}

	// Drawing incomplete words.
	for (let i = 0; i < textObject.incompleteWords.length; i++) {
		// Skip the first word if it is current.
		if (currentWordLetter < currentWordLength - 1 && i === 0) {
			continue;
		}
		render.fillText(textObject.incompleteWords[i], 10 + startX, 430 + (24 * line));

		// Check if new line is needed.
		horizontalWordCount++;
		if (horizontalWordCount > 7) {
			// Starting new line.
			startX = 0;
			line++;
			horizontalWordCount = 0;
		} else {
			// Continue line.
			startX += render.measureText(textObject.incompleteWords[i]).width;
		}
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

				if (incompleteingredientarray[0].currentletter === incompleteingredientarray[0].word.length)				// Player has completed a word.
				{
					completeWordLogic();
				}

				if (incompleteingredientarray.length == 0) {																// Player has completed order.
					successlogic();
				}
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

	if (event.key === "ArrowUp" && clicked === true) {
		volume < 10 ? volume += 1 : volume = 10;
		playsound("click.mp3");
	} else if (event.key === "ArrowDown" && clicked === true) {
		volume > 0 ? volume -= 1 : volume = 0;
		playsound("click.mp3");
	}

	if ((event.key === " " || event.key === "ArrowDown" || event.key === "ArrowUp")) {		// Prevents page from scrolling down when player presses spacebar. 
		event.preventDefault();
	}

})


document.addEventListener("click", event => {
	clicked = true;
})


// Game logic


function generateorder() {
	let remainingwords = wordsperorder;
	incompleteingredientarray.splice(0, incompleteingredientarray.length);
	completeingredientarray.splice(0, completeingredientarray.length);
	toppingarray.splice(0, toppingarray.length);

	// Pick random word from list, reduce remainingwords by 1, and capitalizes first word.
	let randomnumber = Math.floor(Math.random() * wordlist.length);

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
		randomnumber = Math.floor(Math.random() * wordlist.length);
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
srcarray.splice(0, srcarray.length);		// Erase unused by this point array to save memory.
