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
