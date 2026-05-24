# Neural Driving Simulator

A browser-based self-driving car simulation using JavaScript, ray-cast sensors, collision detection, traffic simulation, and a simple neural network controller.

This project is based on Radu Mariescu-Istodor's Self-Driving Car JavaScript course. I used the original tutorial project as a foundation and extended it with my own interface controls, simulation metrics, model persistence options, and documentation.

## Features

- Browser-based driving simulation with no external libraries
- Ray-cast sensor visualization
- Collision detection against road borders and traffic cars
- Neural network controller for AI-driven cars
- Visualized neural network activity
- Save, reset, export, and import the best neural network model
- Configurable training controls for car count, mutation rate, and traffic density
- Real-time simulation metrics for distance, crashes, cars alive, and best fitness score

## How to Run

Open `index.html` directly in a browser, or run a local development server:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Controls

Use the control panel to configure:

- **Cars**: number of AI cars generated for each run
- **Mutation Rate**: amount of random variation applied to cloned neural networks
- **Traffic Density**: number of dummy traffic cars spawned ahead of the AI cars

Use the model buttons to:

- **Save** the current best model to browser local storage
- **Reset** the saved model
- **Export** the saved model as a JSON file
- **Import** a saved JSON model

## My Additions

- Added configurable training controls for mutation rate, car count, and traffic density
- Added simulation metrics including distance traveled, crashes, cars alive, and best fitness score
- Added model save/reset/export/import behavior
- Improved documentation and setup instructions

## Planned Improvements

- Refactor the project into `src/` and `styles/` folders for readability
- Add GitHub Pages deployment
- Add additional training statistics over time
- Add tests for neural network utility functions

## Credits

Based on Radu Mariescu-Istodor's Self-Driving Car JavaScript course.

## License

This project preserves the original MIT license.

# Neural Driving Simulator

A browser-based self-driving car simulation built with vanilla JavaScript, HTML canvas, ray-cast sensors, collision detection, traffic cars, and a simple neural network controller.

This project is based on Radu Mariescu-Istodor's Self-Driving Car JavaScript course. I used the tutorial project as the foundation, then added a training dashboard, configurable simulation settings, model persistence tools, and clearer documentation.

## Project Overview

The simulation trains a population of AI cars to drive along a multi-lane road while avoiding road borders and dummy traffic cars. Each AI car uses ray-cast sensor readings as neural network inputs. The best-performing car can be saved, then reused as the parent model for future training runs. New runs mutate copies of the saved model so the cars can explore slightly different driving behaviors.

This is a lightweight evolutionary training demo, not a production autonomous-driving system. The cars do not understand traffic laws or lane rules explicitly; they learn behavior through repeated mutation and manual saving of better-performing models.

## Features

- Browser-based simulation with no external JavaScript libraries
- HTML canvas road, traffic, car, sensor, and neural-network visualization
- Ray-cast sensors for detecting road borders and traffic cars
- Collision detection against road borders and traffic vehicles
- Simple feed-forward neural network controller
- Mutation-based model variation across training runs
- Dashboard controls for car count, mutation rate, and traffic density
- Restartable simulation without manually refreshing the page
- Live metrics for distance, best fitness, cars alive, crashes, and saved model status
- Save, reset, export, and import model behavior using browser local storage and JSON files

## How to Run

You can open `index.html` directly in a browser.

For a cleaner local setup, run a development server from the project folder:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Dashboard Controls

### Training Controls

- **Cars**: Number of AI cars generated for each run.
- **Mutation Rate**: Amount of random variation applied to copied neural networks.
- **Traffic Density**: Number of dummy traffic cars placed ahead of the AI cars.
- **Restart Simulation**: Starts a new generation using the current settings.

### Model Controls

- **Save Model**: Saves the current best car's neural network to browser local storage.
- **Reset Model**: Clears the saved model and restarts from random neural networks.
- **Export Model**: Downloads the current best neural network as a JSON file.
- **Import Model**: Loads a previously exported JSON model.

## How Training Works

1. The simulation creates a population of AI cars.
2. Each AI car receives sensor readings as neural network inputs.
3. The neural network outputs movement controls: forward, left, right, and reverse.
4. The best car is selected based on how far it travels.
5. When you click **Save Model**, that car's neural network is stored in local storage.
6. On the next restart, the saved model is copied into the new generation.
7. All copied models except the first are mutated so the new generation can explore variations.

Saving is manual. If a later car performs better, you must click **Save Model** again to store that improved model.

## Recommended Training Settings

A good starting point is:

```text
Cars: 300
Mutation Rate: 0.10
Traffic Density: 7
```

If all cars behave almost identically, increase the mutation rate slightly. If cars swerve randomly or crash immediately, lower the mutation rate.

## My Additions

- Added a dashboard-style user interface
- Added configurable controls for car count, mutation rate, and traffic density
- Added restart behavior so users can create new training generations without refreshing manually
- Added live metrics for distance, best fitness, cars alive, crashes, and saved model status
- Added save count and saved-model details so it is clearer when a new model has been saved
- Added model reset, export, and import behavior
- Improved project documentation and usage instructions

## Known Limitations

- Training is manual; the user decides when to save a better model.
- The model uses a very small neural network and simple mutation, not modern reinforcement learning.
- The car does not explicitly understand lanes, overtaking, traffic rules, or long-term planning.
- A saved bad model can make future generations perform poorly until the model is reset.
- Results can vary because random initialization and mutation strongly affect training.

## Planned Improvements

- Add a training-history chart to track best distance or fitness over time
- Add named traffic scenarios such as Original, Random, Dense, and Overtaking Challenge
- Add a clearer generation counter
- Add GitHub Pages deployment
- Refactor files into `src/`, `styles/`, and `assets/` folders for maintainability
- Add basic tests for neural network and utility functions

## Credits

Based on Radu Mariescu-Istodor's Self-Driving Car JavaScript course and original Self-Driving Car project.

## License

This project preserves the original MIT license. The original license file should remain in the repository.