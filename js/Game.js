class Game {
  constructor() {
    this.maxPlayers = 10;
    this.minPlayers = 2;
    this.totalQuestions = 3;
    this.questionWait = 5;
    this.answerWait = 5;
    this.waitTime = 10;
    this.questionNumber = 0;
    this.currentQuestion = null;
    this.allQuestions = null;
    this.difficulty = "easy";
    this.answerOptions = createRadio();
    this.questionEle = createElement("h2");
    this.roundPlayers = 0;
    this.messageEle = createElement("h2");
    this.maxRound = 3;
    this.playerScores = [];
    this.roundType = "fast";
    this.submitButton = createButton("Submit");
  }

  getState() {
    var gameStateRef = database.ref("gameState");
    gameStateRef.on("value", function (data) {
      gameState = data.val();
    });
  }
  update(state) {
    database.ref("/").update({
      gameState: state,
    });
  }
  getCounter() {
    var gameStateRef = database.ref("counter");
    gameStateRef.on("value", function (data) {
      counter = data.val();
    });
  }
  updateCounter(ctr) {
    database.ref("/").update({
      counter: ctr,
    });
  }

  async getQuestionAPI(num, level) {
    var tokenref = await fetch(
      "https://opentdb.com/api_token.php?command=request"
    );

    var tokenJSON = await tokenref.json();

    token = tokenJSON.token;

    var url =
      "https://opentdb.com/api.php?amount=" +
      num +
      "&this.difficulty=" +
      level +
      "&type=multiple&token=" +
      token;

    var response = await fetch(url);

    var responseJSON = await response.json();

    if (responseJSON.response_code == 4) {
      fetch("https://opentdb.com/api_token.php?command=reset&token=" + token);
    }
    var allQuestions = responseJSON.results;
    // console.log(allQuestions);
    database.ref("/").update({
      allQuestions: allQuestions,
    });
  }
  async getQuestion() {
    var gameStateRef = await database.ref("allQuestions");

    gameStateRef.on("value", (data) => {
      this.allQuestions = data.val();
      //console.log(this.allQuestions);
    });
  }

  async getSingleQuestion(count) {
    clear();
    player.updateTime(0);
    this.currentQuestion = this.allQuestions[count - 1];
    if (this.currentQuestion) {
      answersArray = [
        this.currentQuestion.correct_answer,
        ...this.currentQuestion.incorrect_answers,
      ];

      answersArray = this.shuffleArray(answersArray);

      this.answerOptions.hide();
      this.submitButton.hide();
      this.answerOptions = createRadio();
      this.questionEle.show();
      this.questionEle.html(
        this.questionNumber + 1 + ". " + this.currentQuestion.question
      );
      this.questionEle.position(
        displayWidth / 2 - 350,
        displayHeight / 2 - 200
      );
      this.questionEle.style("color", "grey");
      this.answerOptions.show();
      this.submitButton.show();
      this.submitButton.style("height", "50px");
      this.submitButton.style("fontSize", "18");

      this.submitButton.position(width / 2, height / 2 + 200);
      this.submitButton.mousePressed(() => {
        //console.log(counter + this.answerOptions.value());
        player.updateTime(counter, this.answerOptions.value());
      });

      this.answerOptions.style("columnCount", "1");
      this.answerOptions.style("fontSize", "18");

      // this.answerOptions.style("columnWidth", "auto");
      this.answerOptions.style("width", "200px");
      this.answerOptions.style("height", "100px");
      this.answerOptions.option(answersArray[0]);
      this.answerOptions.option(answersArray[1]);
      this.answerOptions.option(answersArray[2]);
      this.answerOptions.option(answersArray[3]);

      this.answerOptions.position(width / 2, height / 2 + 100);
    }
  }

  async start() {
    if (gameState === 0) {
      player = new Player();
      var playerCountRef = await database.ref("playerCount").once("value");
      if (playerCountRef.exists()) {
        playerCount = playerCountRef.val();
        player.getCount();
      }
      var cArray = ["red", "blue", "yellow", "green", "black"];
      colorChoice = createRadio();

      database.ref("/").update({
        colorArray: cArray,
      });
      database.ref("/colorArray").on("value", (data) => {
        colorArray = data.val();
        if (colorArray != []) {
          colorChoice.hide();
          clear();
          colorChoice = createRadio();
          for (var c in colorArray) {
            colorChoice.option(colorArray[c]);
           // colorChoice.style("backgroundColor",colorArray[c] )
          }

          colorChoice.position(width / 2, height / 2 + 150);
          colorChoice.style("height", "250");
          colorChoice.hide();
        }
      });

      form = new Form();
      form.display();
    }
  }
  play() {
    form.hide();
    textAlign(CENTER);
if(player.color!==""){
  push()
  rectMode(CENTER)
  fill(player.color)
  rect(width/2,60,width,120)
pop()
}
    var playerScores = [];
    if (allPlayers != undefined) {
      for (var plr in allPlayers) {
        if (allPlayers[plr].index && allPlayers[plr].active) {
          playerScores.push([
            allPlayers[plr].name,
            allPlayers[plr].score,
            allPlayers[plr].index,
            allPlayers[plr].active,
          ]);
        }
      }
      this.playerScores = playerScores;
      this.playerScores.sort((a, b) => {
        return b[1] - a[1];
      });
      //console.log(this.playerScores);
    }
    this.displayScores(displayWidth - 500, 100, 15, this.playerScores);
    textSize(30);
    text("Round " + player.round, width / 2, height / 2 - 300);
    if (gameMode == "cc") {
      this.chooseColor();
    } else if (gameMode == "c") {
      this.waitForColor();
    } else if (gameMode == "i") {
      this.initialize();
    } else if (gameMode == "q") {
      this.displayQuestion();
    } else if (gameMode == "w") {
      this.wait();
    } else if (gameMode == "a") {
      this.displayAnswer();
    } else if (gameMode == "rchange") {
      // //eliminate players
      this.roundChange();
    } else if (gameMode == "nextRound") {
      this.nextRound();
    } else if (gameMode == "roundresult") {
      this.roundResults();
    }
  }
  chooseColor() {
    if (player.color == "") {
      colorChoice.show();
    }
    player.color = colorChoice.value();
    if (colorArray != undefined) {
      //  console.log(colorArray);

      var cArray = [...colorArray];
      for (var i = cArray.length - 1; i >= 0; i--) {
        //console.log(cArray[i]);

        if (cArray[i] === player.color) {
          console.log(cArray[i]);

          cArray.splice(i, 1);
          console.log(cArray);
        }
      }
      database.ref("/").update({
        colorArray: cArray,
      });
      player.update();
    }
    if (player.color != "") {
      colorChoice.hide();
      player.round = 1;
      player.update();
      gameMode = "c";
    }
  }
  waitForColor() {
    clear();
    // colorChoice.show();
    //console.log("color screen");
    if (rounds === true) {
      colorChoice.hide();
      gameMode = "i";
    }

    rounds = true;

    var index = 0;

    for (var plr in allPlayers) {
      index++;
      if (allPlayers[plr].active && allPlayers[plr].round != 1) {
        text(
          "Waiting for " +
            allPlayers[plr].name +
            " to finish selecting their color ",
          width / 2,
          index * 50 + 150
        );
        rounds = false;
      }
    }
  }
  initialize() {
    this.questionEle.hide();
    clear();
    var winningPLayerIndex = 1;
    if (this.playerScores.length > 0) {
      winningPLayerIndex = this.playerScores[0][2];
    }
    if (this.allQuestions == null && player.index == winningPLayerIndex) {
      this.getQuestionAPI(this.totalQuestions, this.difficulty);
    }
    this.getQuestion();

    this.currentQuestion = null;

    gameMode = "q";
  }
  displayQuestion() {
    if (!this.allQuestions || !this.currentQuestion) {
      text("Loading Questions", width / 2, height / 2);
    }
    if (this.allQuestions) {
      clear();

      this.getSingleQuestion(this.questionNumber + 1);
    }
    if (this.currentQuestion) {
      this.questionNumber++;

      qcounter = counter + this.questionWait;

      gameMode = "w";
    }
  }
  wait() {
    if (this.currentQuestion) {
      text(
        "Answer in " + (qcounter + this.questionWait - counter) + " secs",
        width / 2,
        height / 2
      );
      givenAnswer = this.answerOptions.value();
      if (counter >= qcounter + this.questionWait) {
        gameMode = "a";
        acounter = counter + this.answerWait;
      }
    }
  }
  displayAnswer() {
    this.answerOptions.hide();
    this.submitButton.hide();
    var tempScores = [];

    for (var plr in allPlayers) {
      if (allPlayers[plr].lastAnswer === this.currentQuestion.correct_answer) {
        tempScores.push([
          allPlayers[plr].name,
          allPlayers[plr].score,
          allPlayers[plr].index,
          allPlayers[plr].active,
          allPlayers[plr].timestamp,
          allPlayers[plr].lastAnswer,
        ]);
      }
    }
    tempScores.sort((a, b) => {
      return a[4] - b[4];
    });
    for (var i = 0; i < tempScores.length; i++) {
      if (tempScores[i][2] == player.index) {
        givenAnswer = tempScores[i][5];
        console.log(givenAnswer);
      }
    }
    if (givenAnswer == this.currentQuestion.correct_answer) {
      text("You Got That Right", width / 2, height / 2);
    } else {
      text("You Got That Wrong", width / 2, height / 2 + 50);
    }

    this.messageEle.show();

    this.messageEle.html(
      this.currentQuestion.correct_answer + " is the Correct Answer"
    );
    this.messageEle.position(width / 2, height / 2 + 100);
    text(
      "Next Question in " + (this.answerWait + acounter - counter) + " secs",
      width / 2,
      height / 2 + 250
    );

    if (counter >= acounter + this.answerWait) {
      gameMode = "q";
      this.messageEle.hide();
      if (this.roundType == "fast" && tempScores.length > 0) {
        if (player.index === tempScores[0][2] && tempScores[0][4] != 0) {
          if (
            givenAnswer == this.currentQuestion.correct_answer &&
            player.active
          ) {
            player.score += 10;
            player.update();
          }
        }
      } else {
        if (
          givenAnswer == this.currentQuestion.correct_answer &&
          player.active
        ) {
          player.score += 10;
          player.update();
        }
      }
      if (this.questionNumber == this.totalQuestions) {
        player.round++;
        player.update();
        gameMode = "rchange";
        this.questionEle.hide();

        //updateCounter(10);
        wcounter = this.waitTime + counter;
      }
      this.currentQuestion = null;
    }
  }
  roundChange() {
    if (rounds === true) {
      gameMode = "nextRound";
    }
    rounds = true;

    var index = 0;
    for (var plr in allPlayers) {
      index++;
      if (allPlayers[plr].active && allPlayers[plr].round != player.round) {
        text(
          "Waiting for " +
            allPlayers[plr].name +
            " to finish round " +
            allPlayers[plr].round,
          width / 2,
          index * 50 + 150
        );
        rounds = false;
      }
    }
  }
  nextRound() {
    clear();
    if (player.round == 1) {
      this.gameRound1();
    } else if (player.round == 2) {
      this.gameRound2();
    } else if (player.round == 3) {
      this.gameRound3();
    }
    // else if (player.round == 4) {
    //   this.gameRound4();
    // }

    this.roundPlayers = this.maxPlayers;
    this.currentQuestion = "";
    database.ref("allQuestions").remove();
    if (player.round <= game.maxRound) {
      var roundPlayers = min(playerCount, this.roundPlayers);

      for (var i = roundPlayers; i < this.playerScores.length; i++) {
        if (player.index == this.playerScores[i][2] && player.active) {
          player.active = false;
          player.update();
          gameState = 2;
        }
      }

      text("Round " + player.round, width / 2, height / 2 - 50);

      gameMode = "roundresult";
    } else {
      gameState = 2;
    }
  }
  roundResults() {
    text("Round " + player.round - 1 + " Results", width / 2, height / 2 - 50);

    this.displayScores(width / 2, height / 2, 30, this.playerScores);

    if (counter >= wcounter + this.waitTime) {
      gameMode = "i";
    }
  }
  gameRound1() {
    this.maxPlayers = 15;
    this.minPlayers = 2;
    this.totalQuestions = 3;
    this.questionWait = 5;
    this.answerWait = 5;
    this.questionNumber = 0;
    this.roundType = "fast";

    this.difficulty = "easy";
  }
  gameRound2() {
    this.maxPlayers = 4;
    this.minPlayers = 4;
    this.totalQuestions = 3;
    this.questionWait = 5;
    this.answerWait = 5;
    this.questionNumber = 0;
    this.roundType = "fast";

    this.difficulty = "easy";
  }
  gameRound3() {
    this.maxPlayers = 2;
    this.minPlayers = 2;
    this.totalQuestions = 3;
    this.questionWait = 5;
    this.answerWait = 5;
    this.questionNumber = 0;
    this.roundType = "fast";

    this.difficulty = "easy";
  }
  gameRound4() {
    this.maxPlayers = 2;
    this.minPlayers = 2;
    this.totalQuestions = 3;
    this.questionWait = 5;
    this.answerWait = 5;
    this.questionNumber = 0;
    this.roundType = "fast";
    this.difficulty = "easy";
  }
  displayScores(x, y, size, arr) {
    Player.getPlayerInfo();
    if (allPlayers !== undefined) {
      textSize(size);

      for (var i = 0; i < arr.length; i++) {
        y = y + 30;
        push();

        if (!arr[i][3]) {
          fill("grey");
        } else if (arr[i][2] === player.index) {
          fill(player.color);
        } else {
          fill("brown");
        }

        text(arr[i][0] + ": " + arr[i][1], x, y);
        pop();
      }
    }
  }
  shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  end() {
    clear();
    text("Game Over!", width / 2, height / 2 - 200);
    var playerScores = [];
    for (var plr in allPlayers) {
      if (allPlayers[plr].active) {
        playerScores.push([
          allPlayers[plr].name,
          allPlayers[plr].score,
          allPlayers[plr].index,
          allPlayers[plr].active,
        ]);
      }
    }
    this.playerScores = playerScores;
    this.playerScores.sort((a, b) => {
      return b[1] - a[1];
    });
    this.displayScores(width / 2, height / 2, 50, this.playerScores);
    clear();

    if (player.round <= this.maxRound) {
      if (!player.active) {
        text(
          "Sorry you didn't make it to round " + player.round,
          width / 2,
          height / 2 - 50
        );
        gameState = 2;
      }
    } else if (this.playerScores[0][1] === this.playerScores[1][1]) {
      text(
        "Congratulations!" +
          this.playerScores[0][0] +
          " and " +
          this.playerScores[1][0] +
          " are the Joint Winners of this Game",
        width / 2,
        height / 2 - 200
      );
    } else {
      if (player.index == this.playerScores[0][2]) {
        text(
          "Congratulations!" +
            this.playerScores[0][0] +
            "You are the Winner of this Game",
          width / 2,
          height / 2 - 200
        );
      } else {
        text(
          "Sorry you lost!" + this.playerScores[0][0] + "is the Winner",
          width / 2,
          height / 2 - 200
        );
      }
    }
    this.restart = createButton("Play Again");
    this.restart.position(width / 2, height / 2 + 100);
    this.restart.mousePressed(() => {
      game.update(0);
      player.updateCount(0);
      database.ref("players").remove();
      database.ref("allQuestions").remove();
      game.updateCounter(0);

      game.updateRound(1);
    });
  }
}
