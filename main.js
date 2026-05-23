const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 200;

const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 300;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

let cars = [];
let bestCar = null;
let traffic = [];
let animationFrameId = null;
const BRAIN_VERSION = "sensor-7-hidden-8";

const carCountInput = document.getElementById("carCount");
const mutationRateInput = document.getElementById("mutationRate");
const mutationRateValue = document.getElementById("mutationRateValue");
const trafficDensityInput = document.getElementById("trafficDensity");

const distanceMetric = document.getElementById("distanceMetric");
const fitnessMetric = document.getElementById("fitnessMetric");
const aliveMetric = document.getElementById("aliveMetric");
const crashMetric = document.getElementById("crashMetric");
const savedModelMetric = document.getElementById("savedModelMetric");

restartSimulation();

function save() {
    if (!bestCar || !bestCar.brain) {
        return;
    }

    const previousSaveCount = Number(localStorage.getItem("bestBrainSaveCount")) || 0;
    const newSaveCount = previousSaveCount + 1;
    const savedFitness = getFitness(bestCar);
    const savedDistance = Math.max(0, Math.round(100 - bestCar.y));

    localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
    localStorage.setItem("bestBrainVersion", BRAIN_VERSION);
    localStorage.setItem("bestBrainSaveCount", String(newSaveCount));
    localStorage.setItem("bestBrainSavedFitness", String(savedFitness));
    localStorage.setItem("bestBrainSavedDistance", String(savedDistance));
    localStorage.setItem("bestBrainSavedAt", new Date().toLocaleTimeString());

    updateMetrics();
}

function discard() {
    resetModel();
}

function resetModel() {
    localStorage.removeItem("bestBrain");
    localStorage.removeItem("bestBrainVersion");
    localStorage.removeItem("bestBrainSaveCount");
    localStorage.removeItem("bestBrainSavedFitness");
    localStorage.removeItem("bestBrainSavedDistance");
    localStorage.removeItem("bestBrainSavedAt");
    restartSimulation();
}

function exportModel() {
    if (!bestCar || !bestCar.brain) {
        return;
    }

    const modelData = JSON.stringify(bestCar.brain, null, 2);
    const blob = new Blob([modelData], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "best-brain.json";
    downloadLink.click();

    URL.revokeObjectURL(url);
}

function importModel(event) {
    const file = event.target.files[0];

    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = function () {
        try {
            const importedBrain = JSON.parse(reader.result);
            localStorage.setItem("bestBrain", JSON.stringify(importedBrain));
            localStorage.setItem("bestBrainVersion", BRAIN_VERSION);
            restartSimulation();
        } catch (error) {
            alert("Invalid model file. Please import a valid JSON neural-network model.");
        }
    };

    reader.readAsText(file);
    event.target.value = "";
}

function restartSimulation() {
    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
    }

    const carCount = getNumberInputValue(carCountInput, 100, 1, 1000);
    const mutationRate = getNumberInputValue(mutationRateInput, 0.1, 0, 1);
    const trafficDensity = getNumberInputValue(trafficDensityInput, 7, 0, 50);

    cars = generateCars(carCount);
    bestCar = cars[0];
    traffic = generateTraffic(trafficDensity);

    const savedBrain = localStorage.getItem("bestBrain");
    const savedBrainVersion = localStorage.getItem("bestBrainVersion");

    if (savedBrain && savedBrainVersion === BRAIN_VERSION) {
        for (let i = 0; i < cars.length; i++) {
            cars[i].brain = JSON.parse(savedBrain);

            if (i !== 0) {
                NeuralNetwork.mutate(cars[i].brain, mutationRate);
            }
        }
    } else if (savedBrain && savedBrainVersion !== BRAIN_VERSION) {
        resetModelStorageOnly();
    }

    updateMutationRateLabel();
    animate();
}

function generateCars(count) {
    const generatedCars = [];

    for (let i = 0; i < count; i++) {
        generatedCars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI"));
    }

    return generatedCars;
}

function generateTraffic(count) {
    const generatedTraffic = [];

    const originalPattern = [
        { lane: 1, y: -100 },
        { lane: 0, y: -300 },
        { lane: 2, y: -300 },
        { lane: 0, y: -500 },
        { lane: 1, y: -500 },
        { lane: 1, y: -700 },
        { lane: 2, y: -700 },
    ];

    for (let i = 0; i < count; i++) {
        const pattern = originalPattern[i % originalPattern.length];
        const repeatOffset = Math.floor(i / originalPattern.length) * -800;

        generatedTraffic.push(
            new Car(
                road.getLaneCenter(pattern.lane),
                pattern.y + repeatOffset,
                30,
                50,
                "DUMMY",
                2,
                getRandomColor()
            )
        );
    }

    return generatedTraffic;
}

function getFitness(car) {
    if (!car) {
        return 0;
    }

    const distanceScore = 100 - car.y;
    const crashPenalty = car.damaged ? 1200 : 0;
    const passedTrafficBonus = getPassedTrafficCount(car) * 250;
    const wallPenalty = isNearRoadEdge(car) ? 250 : 0;

    return Math.round(
        distanceScore +
        passedTrafficBonus -
        crashPenalty -
        wallPenalty
    );
}

function getPassedTrafficCount(car) {
    return traffic.filter(trafficCar => car.y < trafficCar.y).length;
}

function isNearRoadEdge(car) {
    const margin = car.width * 0.75;
    const leftEdge = road.left + margin;
    const rightEdge = road.right - margin;

    return car.x < leftEdge || car.x > rightEdge;
}

function updateMetrics() {
    if (!bestCar) {
        return;
    }

    const distance = Math.max(0, Math.round(100 - bestCar.y));
    const bestFitness = getFitness(bestCar);
    const carsAlive = cars.filter(car => !car.damaged).length;
    const crashes = cars.length - carsAlive;
    const savedModelSummary = getSavedModelSummary();

    if (distanceMetric) {
        distanceMetric.textContent = distance;
    }

    if (fitnessMetric) {
        fitnessMetric.textContent = bestFitness;
    }

    if (aliveMetric) {
        aliveMetric.textContent = carsAlive;
    }

    if (crashMetric) {
        crashMetric.textContent = crashes;
    }

    if (savedModelMetric) {
        savedModelMetric.textContent = savedModelSummary;
    }
}

function getSavedModelSummary() {
    if (!localStorage.getItem("bestBrain")) {
        return "No";
    }

    const saveCount = localStorage.getItem("bestBrainSaveCount") || "1";
    const savedFitness = localStorage.getItem("bestBrainSavedFitness") || "?";
    const savedDistance = localStorage.getItem("bestBrainSavedDistance") || "?";
    const savedAt = localStorage.getItem("bestBrainSavedAt") || "unknown time";

    return `Save #${saveCount} | Fitness ${savedFitness} | Distance ${savedDistance} | ${savedAt}`;
}

function resetModelStorageOnly() {
    localStorage.removeItem("bestBrain");
    localStorage.removeItem("bestBrainVersion");
    localStorage.removeItem("bestBrainSaveCount");
    localStorage.removeItem("bestBrainSavedFitness");
    localStorage.removeItem("bestBrainSavedDistance");
    localStorage.removeItem("bestBrainSavedAt");
}

function updateMutationRateLabel() {
    if (!mutationRateInput || !mutationRateValue) {
        return;
    }

    mutationRateValue.textContent = Number(mutationRateInput.value).toFixed(2);
}

function getNumberInputValue(input, fallback, min, max) {
    if (!input) {
        return fallback;
    }

    const value = Number(input.value);

    if (Number.isNaN(value)) {
        input.value = fallback;
        return fallback;
    }

    const clampedValue = Math.min(Math.max(value, min), max);
    input.value = clampedValue;

    return clampedValue;
}

function animate(time = 0) {
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders, []);
    }

    for (let i = 0; i < cars.length; i++) {
        cars[i].update(road.borders, traffic);
    }

    bestCar = cars.reduce((best, car) => {
        return getFitness(car) > getFitness(best) ? car : best;
    }, cars[0]);

    updateMetrics();

    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    carCtx.save();
    carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);

    road.draw(carCtx);

    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(carCtx);
    }

    carCtx.globalAlpha = 0.2;

    for (let i = 0; i < cars.length; i++) {
        cars[i].draw(carCtx);
    }

    carCtx.globalAlpha = 1;
    bestCar.draw(carCtx, true);

    carCtx.restore();

    networkCtx.lineDashOffset = -time / 50;
    Visualizer.drawNetwork(networkCtx, bestCar.brain);

    animationFrameId = requestAnimationFrame(animate);
}

if (mutationRateInput) {
    mutationRateInput.addEventListener("input", updateMutationRateLabel);
}

window.save = save;
window.discard = discard;
window.resetModel = resetModel;
window.exportModel = exportModel;
window.importModel = importModel;
window.restartSimulation = restartSimulation;