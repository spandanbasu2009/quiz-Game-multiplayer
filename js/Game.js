class Game {
  constructor(){

  }

  getState(){
    var gameStateRef  = database.ref('gameState');
    gameStateRef.on("value",function(data){
       gameState = data.val();
    })

  }

  update(state){
    database.ref('/').update({
      gameState: state
    });
  }
  getRound(){
    var gameStateRef  = database.ref('round');
    gameStateRef.on("value",function(data){
       round = data.val();
    })

  }
  getQuestionNumber(){
    var gameStateRef  = database.ref('questionNumber');
    gameStateRef.on("value",function(data){
       questionNumber = data.val();
    })

  }
  async getQuestion(){
    var response = await fetch("https://opentdb.com/api.php?amount=10&type=multiple");
     var responseJSON = await response.json();
     console.log(responseJSON);
     allQuestions = responseJSON.results;
     database.ref('/').update({
      allQuestions: allQuestions
    });
   }
   getSingleQuestion(count){
    var gameStateRef  = database.ref('allQuestions/'+[count]);
    gameStateRef.on("value",function(data){
       currentQuestion = data.val();
    })

  }
  async start(){
    if(gameState === 0){
      player = new Player();
      var playerCountRef = await database.ref('playerCount').once("value");
      if(playerCountRef.exists()){
        playerCount = playerCountRef.val();
        player.getCount();
      }
      form = new Form()
      form.display();
    }
    if(playerCount == 1){
      this.getQuestion();
    }
  }

  play(){
    form.hide();
    this.getSingleQuestion(1);
    Player.getPlayerInfo();
    player.getCarsAtEnd();
    if(allPlayers !== undefined){
      background(rgb(198,135,103));
      // image(ground, 0,0,displayWidth, displayHeight);
      
      //var display_position = 100;
      text(currentQuestion.question,width/2,height/2);
      //index of the array
      var index = 0;

      //x and y position of the cars
      var x = displayWidth-200 ;
      var y = 100;

      for(var plr in allPlayers){
        //add 1 to the index for every loop
        index = index + 1 ;

        //position the cars a little away from each other in x direction
        // x = x + 225;
        y = y+30;
        //use data form the database to display the cars in y direction
        
        textSize(15);
        if (index === player.index){
          fill("green");
        }
        text(allPlayers[plr].name + ": " + allPlayers[plr].score, x,y);
        //textSize(15);
        //text(allPlayers[plr].name + ": " + allPlayers[plr].distance, 120,display_position)
      }

    }
   if(gameMode == "q"){
     this.countdown();
     textAlign(CENTER);
     text(counter,width/2,height/2);
   }
    if(gameMode == "a"){
      //check Answer,score,update db
    }

    
  }

  countdown(){
    counter = 20;
    setInterval(function(){
      counter--;
    },1000);
    setInterval(function(){
      gameMode = "a";
    },20000);
  }

  end(){
    console.log("Game Ended");
    console.log(player.rank);
    if(allPlayers !== undefined){
      background(rgb(198,135,103));
      image(track, 0,-displayHeight*4,displayWidth, displayHeight*5);
      
      //var display_position = 100;
      
      //index of the array
      var index = 0;

      //x and y position of the cars
      var x = 200 ;
      var y;

      for(var plr in allPlayers){
        //add 1 to the index for every loop
        index = index + 1 ;
        if(allPlayers[plr].rank != 0){
          var element = createElement('h3');
          element.html(allPlayers[plr].name+' '+allPlayers[plr].rank);
          element.position(displayWidth/2,allPlayers[plr].rank*30);
          if(index == player.index){
            element.style('color','yellow')
          }
        }
        //position the cars a little away from each other in x direction
        x = x + 225;
        //use data form the database to display the cars in y direction
        y = displayHeight - allPlayers[plr].distance;
        cars[index-1].x = x;
        cars[index-1].y = y;

        if (index === player.index){
          cars[index - 1].shapeColor = "red";
          camera.position.x = displayWidth/2;
          camera.position.y = cars[index-1].y;
          stroke(10);
          fill("red");
          ellipse(x,y,60,60);
        }
       
        //textSize(15);
        //text(allPlayers[plr].name + ": " + allPlayers[plr].distance, 120,display_position)
      }

    }
    drawSprites();
  }
}
