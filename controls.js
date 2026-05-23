// Stores the four possible driving commands for a car.
class Controls{
    constructor(type){
        // Each value is true while that action is active.
        this.forward=false;
        this.left=false;
        this.right=false;
        this.reverse=false;

        switch(type){
            case "KEYS":
                // Human-controlled car.
                this.#addKeyboardListeners();
                break;
            case "DUMMY":
                // Traffic cars always drive straight ahead.
                this.forward=true;
                break;
        }
    }

    #addKeyboardListeners(){
        // Set movement flags when the user presses arrow keys.
        document.onkeydown=(event)=>{
            switch(event.key){
                case "ArrowLeft":
                    this.left=true;
                    break;
                case "ArrowRight":
                    this.right=true;
                    break;
                case "ArrowUp":
                    this.forward=true;
                    break;
                case "ArrowDown":
                    this.reverse=true;
                    break;
            }
        }

        // Clear movement flags when the user releases arrow keys.
        document.onkeyup=(event)=>{
            switch(event.key){
                case "ArrowLeft":
                    this.left=false;
                    break;
                case "ArrowRight":
                    this.right=false;
                    break;
                case "ArrowUp":
                    this.forward=false;
                    break;
                case "ArrowDown":
                    this.reverse=false;
                    break;
            }
        }
    }
}
