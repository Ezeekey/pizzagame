const canvas = document.getElementById("pizzagame");
		const render = canvas.getContext("2d");


		// Game variables
		let score = 0;
		let wordsperorder = 1;					// How many words in an order.
		let successcount = 0;					// How many successful orders have been made by the player.
		const LEVELUPTHRESHOLD = 5;				// How many successful orders must be made before the game adds more words to order.
		const NORMALSCOREVALUE = 10;

		let framestarttime = Date.now();
		let lastframetime = Date.now();
		let orderendtime = Date.now();
		let deltatime = 0;
		const STANDARDORDERTIME = 12000;		// Amount of time player has to type order.

		let lives = 3;

		let state = 0;


		let completeingredientarray = [];

		let incompleteingredientarray = [];

		let toppingarray = [];	// Should contain objects like this {graphic: '', x:0, y:0}

		// List of words.
		const wordlist = [
			{"word": "pepperoni", "graphic": "pepperoni.png"},
			{"word": "mozzarella", "graphic": "mozzarella.png"},
			{"word": "bell pepper", "graphic": "dummy.png"},
			{"word": "tomato", "graphic": "tomato.png"},
			{"word": "olive", "graphic": "olive.png"},
			{"word": "sausage", "graphic": "dummy.png"},
			{"word": "chicken", "graphic": "chicken.png"},
			{"word": "pineapple", "graphic": "pineapple.png"},
			{"word": "bacon", "graphic": "dummy.png"},
			{"word": "onions", "graphic": "onions.png"},
			{"word": "anchovies", "graphic": "anchovies.png"},
			{"word": "jalapeno", "graphic": "dummy.png"},
			{"word": "ham", "graphic": "ham.png"},
			{"word": "car", "graphic": "car.png"},
			{"word": "crowbar", "graphic": "dummy.png"},
			{"word": "beans", "graphic": "beans.png"},
			{"word": "alfredo", "graphic": "alfredo.png"},
			{"word": "pickle", "graphic": "dummy.png"},
			{"word": "mayonnaise", "graphic": "mayo.png"},
			{"word": "ranch", "graphic": "ranch.png"},
			{"word": "buffalo", "graphic": "dummy.png"},
			{"word": "macaroni", "graphic": "macaroni.png"},
			{"word": "grape", "graphic": "grape.png"},
			{"word": "pizza", "graphic": "dummy.png"},
			{"word": "bleu cheese", "graphic": "dummy.png"},
			{"word": "meth", "graphic": "dummy.png"},			// Remove for clean version.
			{"word": "apple", "graphic": "dummy.png"},
			{"word": "pear", "graphic": "dummy.png"},
			{"word": "garlic", "graphic": "dummy.png"},
			{"word": "basil", "graphic": "dummy.png"}
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
			"" ];
		let orderlinered = 
			["", 
			"", 
			"", 
			"", 
			"", 
			"", 
			"" ];
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

		// Sounds
		ding = "sounds/orderbell.mp3";
		fail = "sounds/no.mp3";
		success = "sounds/success.mp3";
		click = "sounds/click.mp3";

		// Graphics

		const defaultpizzax = 400;
		const defaultpizzay = 200;

		let pizzax = 0;
		let pizzay = 0;

		window.requestAnimationFrame(drawgame);
		let srcarray = [
			"check.png", "x.png", "dummy.png", "beans.png", "chicken.png", "ham.png", "macaroni.png",
			"mayo.png", "onions.png", "pepperoni.png", "tomato.png", "alfredo.png", "anchovies.png",
			"car.png", "grape.png", "mozzarella.png", "olive.png", "pineapple.png", "ranch.png"
			]
		let imagestoload = srcarray.length;		// This integer will be used to check if every graphic has been loaded before launching the game.

		let graphicdict = new Map();

		function populategraphicmap(){
			srcarray.forEach((element) =>{
				let newimage = new Image();

				newimage.onload = function () {
					imagestoload -= 1;
					if(imagestoload <= 0){
						state = TITLE;
						filltextlists();
					}
				}

				newimage.src = "pizzagraphic/" + element;

				graphicdict.set(element, newimage);
			})
		}


		function drawgame(){
			// Timing
			lastframetime = framestarttime;
			framestarttime = Date.now();
			deltatime = (framestarttime - lastframetime) / 1000;

			switch(state){
			
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
					break;
				case BEFORETYPING:
					filltextlists();
					playsound(ding);
					state = TYPING;

					render.clearRect(0, 0, 800, 600);
					drawbackground();
					drawcrust(defaultpizzax, defaultpizzay);
					draworder();
					drawtimer();
					drawlives();
					drawscore();
					break;
				case TYPING:
					// Game logic is in keyboard event handler towards bottom of file.

					if (framestarttime > orderendtime) {
						faillogic(fail);		// Replace with a sound saying too slow.
					}

					render.clearRect(0, 0, 800, 600);
					drawbackground();
					drawcrust(defaultpizzax, defaultpizzay);
					drawtoppings();
					draworder();
					drawtimer();
					drawlives();
					drawscore();
					break;
				case SUCCESS:
					pizzax += 800 * deltatime;

					if(pizzax > 800) {
						state = BEFORECREATEPIZZA;
					}

					render.clearRect(0, 0, 800, 600);
					drawbackground();
					drawcrust(defaultpizzax + pizzax, defaultpizzay);
					drawtoppings();
					drawlives();
					drawscore()
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
					break;
				case CREATEPIZZA:
					pizzax += 800 * deltatime;

					if(pizzax >= 0) {
						pizzax = 0;
						state = BEFORETYPING;
					}

					render.clearRect(0, 0 , 800, 600);
					drawbackground();
					drawlives();
					drawcrust(defaultpizzax + pizzax, defaultpizzay);
					drawscore();
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


		function drawloadscreen(){
			render.beginPath();
			render.rect(0, 0, 800, 600);
			render.fillStyle = "black";
			render.fill();
			render.closePath();

			render.font = "60px serif";
			render.fillStyle = "white";
			render.fillText("Loading...", 100, 100);
		}


		function drawbackground(){
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


		function drawcrust(x, y){
			render.beginPath();
			render.arc(x, y, 175, 0, 2 * Math.PI);
			render.fillStyle = "#DBBB6D";
			render.fill();
			render.closePath();
		}


		function draworder(){
			const BEGINLINE = 10;
			let textstart = BEGINLINE;

			for (let i = 0; i < 7; i++){
			render.font = "20px courier";
			render.fillStyle = "green";
			render.fillText(orderlinegreen[i], 10, 430 + (24 * i));
			measure = render.measureText(orderlinegreen[i]);
			textstart +=  measure.width;
			render.fillStyle = "red";
			render.fillText(orderlinered[i], textstart, 430+ (24 * i));
			measure = render.measureText(orderlinered[i]);
			textstart += measure.width;
			render.fillStyle = "black";
			render.fillText(orderlineblack[i], textstart, 430+ (24 * i));
			textstart = BEGINLINE;
			}

		}

		function drawgameover() {
			render.font = "60px serif";
			render.fillStyle = "black";
			render.fillText("Game over", 150, 200);
		}


		function drawtimer(){
			render.font = "24px serif";
			render.fillStyle = "black";
			render.fillText("Time :" + Math.floor((orderendtime - framestarttime) / 1000), 675, 30);
		}


		function drawlives(){
			let lifecounter = lives;		// This counts the amount of lives the player has in the for loop so the program knows whether to draw an x or check.
			let currentgraphic = graphicdict.get("check.png")
			for(let i = 0; i <= 2; i++){
				if (lifecounter <= 0){
					currentgraphic = graphicdict.get("x.png");				}
				render.drawImage(currentgraphic, 675 + (i * 32), 40);
				lifecounter -= 1;
			}
		}


		function drawscore() {
			render.font = "24px serif";
			render.fillStyle = "black";
			render.fillText("Score: " + score, 25, 30);
		}

		
		function droptoppings(graphic) {
			// Put 5 toppings at random spots on pizza.

            // TODO: Change algorithm so toppings are dropped in a more even fashion.
            //      Also add rotation to toppings as they drop.
			console.log("droptoppings called.");
			for (let i = 5; i > 0; i--) {
				newX = Math.random() * 250 + 225;
				newY = Math.random() * 250 + 25;

				toppingarray.push(
					{"graphic":graphic, 
					"x": newX, 
					"y": newY});
					console.log("topping dropped");
					console.log("x: " + newX);
					console.log("y: " + newY);
			}
		}


		function drawtoppings() {
			// Go through array of toppings, and draw each of them
			// with a modifier for pizza position.

			for (let i = 0; i < toppingarray.length; i++) {
				render.drawImage(graphicdict.get(toppingarray[i].graphic), toppingarray[i].x + pizzax, toppingarray[i].y + pizzay);
				console.log("I'm trying to draw!");
			}
		}


		function cleartextgraphics(){
			orderlinegreen = ["", "", "", "", "", "", ""];
			orderlinered = ["", "", "", "", "", "", ""];
			orderlineblack = ["", "", "", "", "", "", ""];
		}

		function filltextlists(){
			let currentline = 0;
			let wordnumber = 0;

			// Erase all graphic text lists.
			cleartextgraphics();

			function addwordnumber(){
				wordnumber += 1;

				if(wordnumber > 9){
					wordnumber = 0;
					currentline += 1;
				}
			}

			for(i = 0; i < completeingredientarray.length; i++){			// Counting all completed words.
				orderlinegreen[currentline] += completeingredientarray[i];
				addwordnumber();
			}
			if(incompleteingredientarray.length > 0){				
				for(i = 0; i < incompleteingredientarray[0].word.length; i++){	// Building the first word
					if(i < incompleteingredientarray[0].currentletter){									// Already typed letters.
						orderlinegreen[currentline] += (incompleteingredientarray[0].word.charAt(i));
					}
					else if(i == incompleteingredientarray[0].currentletter){							// Current letter to type.
						orderlinered[currentline] += (incompleteingredientarray[0].word.charAt(i));
					}
					else{																				// Letters that haven't been typed yet.
						orderlineblack[currentline] += (incompleteingredientarray[0].word.charAt(i));
					}
				}
			}

			addwordnumber();

			for(i = 1; i < incompleteingredientarray.length; i++){									// Counting all words that haven't been typed.
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
		}

		function playsound(sound) {
			let playedsound = document.createElement("audio");
			playedsound.src = sound;
			document.body.appendChild(playedsound);
			playedsound.play();

			playedsound.onended = function () {
				this.parentNode.removeChild(playedsound);
			}
		}

		// Input.

		document.addEventListener("keydown", (event) => {
			switch(state) {
				case TYPING: 
					if(event.key === incompleteingredientarray[0].word.charAt(incompleteingredientarray[0].currentletter)) {	// Player has typed highlighted letter.
						incompleteingredientarray[0].currentletter += 1;
						playsound(click);

						if(incompleteingredientarray[0].currentletter == incompleteingredientarray[0].word.length)				// Player has completed a word.
						{
							removedword = incompleteingredientarray.shift();
							completeingredientarray.push(removedword.word);
							score += removedword.score;
							if (removedword.graphic != "") {
								droptoppings(removedword.graphic);
							}
						}

						if(incompleteingredientarray.length == 0){																// Player has completed order.
							state = SUCCESS;
							successlogic();
						}
						filltextlists();
					} else if (event.key === "Shift") {	// Allows capitalization of letters without losing score.
							// Do nothing.
					} else if (event.key === "Control" || event.key === "Alt" || event.key === "Tab") { 						// Exclude other inputs like tab, control, and alt so player does not lose score.
						// Do nothing.
					} else {							// Player fails at typing highlighted letter.
						faillogic(fail);
					}
					break;
				case TITLE:
					if (event.key === " ") {
						startgame();
					}
					break;
			}

			if(event.keyCode == 32 && event.target == document.body) {		// Prevents page from scrolling down when player presses spacebar. 
				event.preventDefault();
			}
		})

		// Game logic

		function generateorder() {
			let remainingwords = wordsperorder;
			incompleteingredientarray = [];
			toppingarray = [];

			// Pick random word from list, reduce remainingwords by 1, and capitalizes first word.
			let randomnumber = Math.floor(Math.random() * WORDLISTLENGTH);
			let newword = wordlist[randomnumber]["word"];
			const firstletter = newword.charAt(0).toUpperCase();
			const restofword = newword.slice(1);

			incompleteingredientarray.push({"word": firstletter + restofword, "currentletter": 0, 
											"graphic": wordlist[randomnumber].graphic, "score": NORMALSCOREVALUE}); 

			remainingwords--;

			while(remainingwords > 0) {
				// Add comma first.
				incompleteingredientarray.push({"word": ", ", "currentletter": 0, "graphic": "", "score": 0});

				// Add word.
				randomnumber = Math.floor(Math.random() * WORDLISTLENGTH);
				incompleteingredientarray.push({"word": wordlist[randomnumber].word, "currentletter": 0,
												"graphic": wordlist[randomnumber].graphic, "score": NORMALSCOREVALUE});
				remainingwords--;
			}
		}

		function successlogic() {
			successcount++;
			completeingredientarray = [];
			playsound(success);

			if (successcount >= LEVELUPTHRESHOLD) {
				wordsperorder++;
				successcount = 0;
			}
		}

		function faillogic(sound) {
			state = FAIL;
			completeingredientarray = [];
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

		// Game start
		populategraphicmap();
		filltextlists();
