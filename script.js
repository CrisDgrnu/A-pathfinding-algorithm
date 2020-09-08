//CANVAS
var canvas;
var ctx;

//CELL MEASUREMENTS
var widthCell;
var heightCell

//REFRESH
var FPS = 900000


//BOARD
var cols = 50
var rows = 50
var board;

//COLORS
const wall = "#0A2733"
const empty = "#3DA8CC"
const OS = "#2F6F96"
const CS = "#2F6F96"
const P = "#24A35F"

//PATH
var start;
var end;

//PATHFINDER SETTINGS
var openSet = []
var closeSet = []
var path = []
var finish = false



//Board methods

function createMatrix(r,c){
    var obj = []
    for (let i = 0; i < r; i++) {
        obj.push([])
        for (let j = 0; j < c; j++) {
            obj[i].push(0)
        }
    }
    
    return obj
}

function clearBoard(){
    canvas.width = canvas.width
    canvas.height = canvas.height
}

function paintBoard(){
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            board[i][j].paint() 
        }
    }

    for (let i = 0; i < openSet.length; i++) {
        openSet[i].paintOS()
    }

    for (let i = 0; i < closeSet.length; i++) {
        closeSet[i].paintCS()
    }

    for (let i = 0; i < path.length; i++) {
        path[i].paintPath()
    }
}


//Operations

function heuristic(a,b){
    var x = Math.abs(a.x - b.x)
    var y = Math.abs(a.y - b.y)

    var dist = x+y
    
    return dist
}

function deleteFromArray(array,element){
    for (let i = array.length; i >= 0; i--) {
        if(array[i] == element){
            array.splice(i,1)
        }
    }
}



//Cell prototype
function cell(x,y){

    //Position
    this.x = x;
    this.y = y;

    //type (Wall = 1, empty = 0)
    this.type = 0

    let random = Math.floor(Math.random()*4) //0-4

    if (random == 1)    
        this.type = 1

    //PESOS
    this.f = 0 //Total cost
    this.g = 0 //Steps
    this.h = 0 //Heuristic

    this.adj = []
    this.ori = null

    //Calculate adjacents cells
    this.pushAdj = function(){
        if (this.x>0)
            this.adj.push(board[this.y][this.x-1])
        
        if (this.x < rows-1)
            this.adj.push(board[this.y][this.x+1])

        if (this.y>0)
            this.adj.push(board[this.y-1][this.x])
        
        if (this.y < rows-1)
            this.adj.push(board[this.y+1][this.x])
    }

    //Paint the cell
    this.paint = function(){
        var color;

        if (this.type == 0)
            color = empty
        if (this.type == 1 )
            color = wall

        ctx.fillStyle = color;
        ctx.fillRect(this.x*widthCell,this.y*heightCell,widthCell,heightCell)
    }

    //Paint openSet
    this.paintOS = function(){
        ctx.fillStyle = OS
        ctx.fillRect(this.x*widthCell,this.y*heightCell,widthCell,heightCell)
    }

    //Paint closeSet
    this.paintCS = function(){
        ctx.fillStyle = CS
        ctx.fillRect(this.x*widthCell,this.y*heightCell,widthCell,heightCell)
    }

    //Paint path
    this.paintPath = function(){
        ctx.fillStyle = P
        ctx.fillRect(this.x*widthCell,this.y*heightCell,widthCell,heightCell)
    }
}



function inicialize(){
    canvas = document.getElementById('canvas')
    ctx = canvas.getContext('2d')

    //Calculate cell measurements
    widthCell = parseInt(canvas.width/cols)
    heightCell = parseInt(canvas.height/rows)

    //Create board
    board = createMatrix(rows,cols)

    //Generate maze
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            board[i][j] = new cell(j,i)
        }
    }

    //Add adjacents
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            board[i][j].pushAdj();
        }
    }

    //Create start and end of the path
    start = board[0][0]
    end = board[cols-1][rows-1]

    //Initialize openSet
    openSet.push(start)
    setInterval(function(){main()},1000/FPS)
}

function pathfinding(){
    if (finish != true){
        if(openSet.length > 0){
            var best = 0;

            for (let i = 0; i < openSet.length; i++) {
                if(openSet[i].f < openSet[best].f){
                    best = i
                }
            }

            var current = openSet[best]

            if (current === end){

                var temp = current
                path.push(temp)

                while(temp.ori != null){
                    temp = temp.ori
                    path.push(temp)
                }
                finish = true
            }

            else{
               deleteFromArray(openSet,current) 
               closeSet.push(current)

               var adj = current.adj

               for (let i = 0; i < adj.length; i++) {
                   var elementAdj = adj[i]
                   
                   if(!closeSet.includes(elementAdj) && elementAdj.type != 1){
                        var tempG = current.g + 1

                        if(openSet.includes(elementAdj)){
                            if(tempG < elementAdj){
                                elementAdj.g = tempG
                            }
                        }

                        else{
                            elementAdj.g = tempG
                            openSet.push(elementAdj)
                        }
                        
                        elementAdj.h = heuristic(elementAdj,end)
                        elementAdj.f = elementAdj.g + elementAdj.h

                        elementAdj.ori = current


                   } 
               }
            }
        }

        else{
            finish = true
        }
    }
}

function main(){
    clearBoard()
    pathfinding()
    paintBoard()
    
}
