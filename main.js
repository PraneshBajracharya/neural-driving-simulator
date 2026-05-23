// Main simulation setup and animation loop.
// This file connects the UI controls, car simulation, neural network, and canvas rendering.

// Canvas used for the road and cars.
const carCanvas=document.getElementById("carCanvas");
carCanvas.width=200;

// Canvas used for the neural-network visualization.
const networkCanvas=document.getElementById("networkCanvas");
networkCanvas.width=300;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

// Road is centered inside the car canvas and uses 90% of the canvas width.
const road=new Road(carCanvas.width/2,carCanvas.width*0.9);

// Simulation state. These arrays are recreated when the user restarts training.
let cars=[];
let traffic=[];
let bestCar=null;
let mutationRate=0.10;

// UI elements for training configuration.
const carCountInput=document.getElementById("carCount");
const mutationRateInput=document.getElementById("mutationRate");
const mutationRateValue=document.getElementById("mutationRateValue");
const trafficDensityInput=document.getElementById("trafficDensity");

// Keep the visible mutation-rate value synchronized with the slider.
mutationRateInput.addEventListener("input",()=>{
    mutationRate=Number(mutationRateInput.value);
    mutationRateValue.innerText=mutationRate.toFixed(2);
});

// Start the first simulation immediately when the page loads.
restartSimulation();
animate();

// Saves the current best car's neural network to browser localStorage.
function save(){
    if(!bestCar || !bestCar.brain){
        return;
    }

    localStorage.setItem("bestBrain",
        JSON.stringify(bestCar.brain));
    updateSavedModelMetric();
}

// Deletes the saved model and restarts with randomly initialized cars.
function resetModel(){
    localStorage.removeItem("bestBrain");
    restartSimulation();
    updateSavedModelMetric();
}

// Downloads the saved model as a JSON file so it can be backed up or shared.
function exportModel(){
    const model=localStorage.getItem("bestBrain");

    if(!model){
        alert("No saved model found. Save a model before exporting.");
        return;
    }

    const blob=new Blob([model],{type:"application/json"});
    const link=document.createElement("a");
    link.href=URL.createObjectURL(blob);
    link.download="best-brain.json";
    link.click();
    URL.revokeObjectURL(link.href);
}

// Imports a saved model JSON file and stores it as the active best brain.
function importModel(event){
    const file=event.target.files[0];

    if(!file){
        return;
    }

    const reader=new FileReader();

    reader.onload=function(e){
        try{
            // Parse once to validate that the imported file is valid JSON.
            JSON.parse(e.target.result);
            localStorage.setItem("bestBrain",e.target.result);
            restartSimulation();
            updateSavedModelMetric();
        }catch(error){
            alert("Invalid model file. Please import a valid JSON model.");
        }
    };

    reader.readAsText(file);

    // Reset the file input so importing the same file again still triggers onchange.
    event.target.value="";
}

// Recreates cars and traffic using the current UI settings.
function restartSimulation(){
    const carCount=Math.max(1,Number(carCountInput.value));
    const trafficDensity=Math.max(0,Number(trafficDensityInput.value));
    mutationRate=Number(mutationRateInput.value);
    mutationRateValue.innerText=mutationRate.toFixed(2);

    cars=generateCars(carCount);
    bestCar=cars[0];

    // If a saved model exists, copy it into every AI car. Mutate all cars except
    // the first one so there is one exact baseline and many variations.
    const savedBrain=localStorage.getItem("bestBrain");
    if(savedBrain){
        for(let i=0;i<cars.length;i++){
            cars[i].brain=JSON.parse(savedBrain);
            if(i!==0){
                NeuralNetwork.mutate(cars[i].brain,mutationRate);
            }
        }
    }

    traffic=generateTraffic(trafficDensity);
    updateSavedModelMetric();
    updateMetrics();
}

// Creates a population of AI cars starting in the center lane.
function generateCars(count){
    const generatedCars=[];
    for(let i=1;i<=count;i++){
        generatedCars.push(new Car(road.getLaneCenter(1),100,30,50,"AI"));
    }
    return generatedCars;
}

// Creates dummy traffic cars distributed across lanes and spaced vertically.
function generateTraffic(count){
    const generatedTraffic=[];
    const startY=-100;
    const spacing=200;

    for(let i=0;i<count;i++){
        const lane=i%3;
        const y=startY-Math.floor(i/3+1)*spacing;
        generatedTraffic.push(
            new Car(road.getLaneCenter(lane),y,30,50,"DUMMY",2,getRandomColor())
        );
    }

    return generatedTraffic;
}

// Updates the metrics panel with the current best-car performance.
function updateMetrics(){
    if(!bestCar){
        return;
    }

    const aliveCars=cars.filter(car=>!car.damaged).length;
    const crashedCars=cars.length-aliveCars;

    // Cars drive upward, so smaller y-values mean more forward progress.
    const distance=Math.max(0,Math.round(100-bestCar.y));
    const fitness=distance;

    document.getElementById("distanceMetric").innerText=distance;
    document.getElementById("fitnessMetric").innerText=fitness;
    document.getElementById("aliveMetric").innerText=aliveCars;
    document.getElementById("crashMetric").innerText=crashedCars;
}

// Shows whether a neural-network model is currently saved in localStorage.
function updateSavedModelMetric(){
    document.getElementById("savedModelMetric").innerText=
        localStorage.getItem("bestBrain")?"Yes":"No";
}

// Runs once per animation frame. Updates simulation state, redraws both canvases,
// and schedules the next frame.
function animate(time){
    // Move traffic first so AI cars react to current traffic positions.
    for(let i=0;i<traffic.length;i++){
        traffic[i].update(road.borders,[]);
    }

    // Update every AI car in the population.
    for(let i=0;i<cars.length;i++){
        cars[i].update(road.borders,traffic);
    }

    // The best car is the one that has traveled farthest upward.
    bestCar=cars.find(
        c=>c.y==Math.min(
            ...cars.map(c=>c.y)
        ));

    updateMetrics();

    // Match canvas height to the current browser window height.
    carCanvas.height=window.innerHeight;
    networkCanvas.height=window.innerHeight;

    // Keep the camera centered slightly ahead of the best car.
    carCtx.save();
    carCtx.translate(0,-bestCar.y+carCanvas.height*0.7);

    // Draw road, traffic, faint population, and highlighted best car.
    road.draw(carCtx);
    for(let i=0;i<traffic.length;i++){
        traffic[i].draw(carCtx);
    }
    carCtx.globalAlpha=0.2;
    for(let i=0;i<cars.length;i++){
        cars[i].draw(carCtx);
    }
    carCtx.globalAlpha=1;
    bestCar.draw(carCtx,true);

    carCtx.restore();

    // Animate dashed network lines and redraw the best car's network.
    networkCtx.lineDashOffset=-time/50;
    Visualizer.drawNetwork(networkCtx,bestCar.brain);
    requestAnimationFrame(animate);
}
