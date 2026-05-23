const carCanvas=document.getElementById("carCanvas");
carCanvas.width=200;
const networkCanvas=document.getElementById("networkCanvas");
networkCanvas.width=300;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road=new Road(carCanvas.width/2,carCanvas.width*0.9);

let cars=[];
let traffic=[];
let bestCar=null;
let mutationRate=0.10;

const carCountInput=document.getElementById("carCount");
const mutationRateInput=document.getElementById("mutationRate");
const mutationRateValue=document.getElementById("mutationRateValue");
const trafficDensityInput=document.getElementById("trafficDensity");

mutationRateInput.addEventListener("input",()=>{
    mutationRate=Number(mutationRateInput.value);
    mutationRateValue.innerText=mutationRate.toFixed(2);
});

restartSimulation();
animate();

function save(){
    if(!bestCar || !bestCar.brain){
        return;
    }

    localStorage.setItem("bestBrain",
        JSON.stringify(bestCar.brain));
    updateSavedModelMetric();
}

function resetModel(){
    localStorage.removeItem("bestBrain");
    restartSimulation();
    updateSavedModelMetric();
}

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

function importModel(event){
    const file=event.target.files[0];

    if(!file){
        return;
    }

    const reader=new FileReader();

    reader.onload=function(e){
        try{
            JSON.parse(e.target.result);
            localStorage.setItem("bestBrain",e.target.result);
            restartSimulation();
            updateSavedModelMetric();
        }catch(error){
            alert("Invalid model file. Please import a valid JSON model.");
        }
    };

    reader.readAsText(file);
    event.target.value="";
}

function restartSimulation(){
    const carCount=Math.max(1,Number(carCountInput.value));
    const trafficDensity=Math.max(0,Number(trafficDensityInput.value));
    mutationRate=Number(mutationRateInput.value);
    mutationRateValue.innerText=mutationRate.toFixed(2);

    cars=generateCars(carCount);
    bestCar=cars[0];

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

function generateCars(count){
    const generatedCars=[];
    for(let i=1;i<=count;i++){
        generatedCars.push(new Car(road.getLaneCenter(1),100,30,50,"AI"));
    }
    return generatedCars;
}

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

function updateMetrics(){
    if(!bestCar){
        return;
    }

    const aliveCars=cars.filter(car=>!car.damaged).length;
    const crashedCars=cars.length-aliveCars;
    const distance=Math.max(0,Math.round(100-bestCar.y));
    const fitness=distance;

    document.getElementById("distanceMetric").innerText=distance;
    document.getElementById("fitnessMetric").innerText=fitness;
    document.getElementById("aliveMetric").innerText=aliveCars;
    document.getElementById("crashMetric").innerText=crashedCars;
}

function updateSavedModelMetric(){
    document.getElementById("savedModelMetric").innerText=
        localStorage.getItem("bestBrain")?"Yes":"No";
}

function animate(time){
    for(let i=0;i<traffic.length;i++){
        traffic[i].update(road.borders,[]);
    }
    for(let i=0;i<cars.length;i++){
        cars[i].update(road.borders,traffic);
    }

    bestCar=cars.find(
        c=>c.y==Math.min(
            ...cars.map(c=>c.y)
        ));

    updateMetrics();

    carCanvas.height=window.innerHeight;
    networkCanvas.height=window.innerHeight;

    carCtx.save();
    carCtx.translate(0,-bestCar.y+carCanvas.height*0.7);

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

    networkCtx.lineDashOffset=-time/50;
    Visualizer.drawNetwork(networkCtx,bestCar.brain);
    requestAnimationFrame(animate);
}
