# Project Documentation

This folder contains architecture documentation for the project.

- Architecture Component Diagram (C4 Container level): `architecture-component-diagram.puml`
- C4 Deployment Diagram: `c4-deployment-diagram.puml`
- Classic Deployment Diagram: `deployment-diagram.puml`

Rendering instructions:
- Use any PlantUML-compatible renderer or IDE plugin (e.g., IntelliJ IDEA, WebStorm, VS Code) to preview the `.puml` files.
- The C4 diagrams reference C4-PlantUML via remote include URLs. Ensure your environment allows network access for includes or install the C4-PlantUML library locally if needed.

PlantUML Plugin with Graphviz
- Install Graphviz locally (`brew install graphviz` on macOS, `choco install graphviz` on Windows).
- Ensure PlantUML plugin can find dot executable (needed for layout).
- This setup gives the best rendering quality.

