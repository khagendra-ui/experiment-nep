# NepSafe Diagrams Documentation

This folder contains PlantUML diagram files for the NepSafe Tourism Platform report.

## How to Use

### Option 1: Online PlantUML Editor
1. Go to [PlantUML Online Editor](https://www.plantuml.com/plantuml/uml/)
2. Copy the content from any `.puml` file
3. Paste it into the editor
4. The diagram will be generated automatically
5. Download as PNG or SVG

### Option 2: VS Code Extension
1. Install the "PlantUML" extension in VS Code
2. Open any `.puml` file
3. Press `Alt + D` to preview the diagram
4. Right-click and export as PNG/SVG

### Option 3: Local Installation
```bash
# Install PlantUML
# On Windows (with Chocolatey)
choco install plantuml

# On macOS (with Homebrew)
brew install plantuml

# Generate diagrams
plantuml erd-diagram.puml
plantuml usecase-diagram.puml
```

## Available Diagrams

### 1. **erd-diagram.puml**
- **Entity Relationship Diagram**
- Shows database schema and relationships
- Entities: User, Hotel, Booking, Permit, EmergencyContact, SafetyTip, TouristSpot, SOSAlert

### 2. **usecase-diagram.puml**
- **Use Case Diagram**
- Shows system functionality for different actors
- Actors: Tourist, Hotel Owner, Administrator, Emergency Services
- Use cases grouped by: Authentication, Hotel Management, Permit Management, Safety & Emergency, Exploration

### 3. **class-diagram.puml**
- **Class Diagram**
- Shows object-oriented structure
- Classes with attributes and methods
- Relationships between classes

### 4. **system-architecture.puml**
- **System Architecture Diagram**
- Shows overall system structure
- Components: Frontend (React), Backend (FastAPI), Database (MongoDB), External APIs
- Communication protocols

### 5. **sequence-booking.puml**
- **Sequence Diagram - Hotel Booking**
- Shows step-by-step booking process
- Interactions between Tourist, Frontend, Backend, Database

### 6. **sequence-permit.puml**
- **Sequence Diagram - Permit Application**
- Shows permit application and approval workflow
- Admin review and email notification process

### 7. **sequence-sos.puml**
- **Sequence Diagram - SOS Emergency Alert**
- Shows emergency alert workflow
- GPS location, notifications, and response process

### 8. **activity-diagram.puml**
- **Activity Diagram - Hotel Booking**
- Shows booking workflow with decision points
- User actions and system responses

### 9. **deployment-diagram.puml**
- **Deployment Diagram**
- Shows physical deployment architecture
- Servers, databases, external services
- Docker containers and network configuration

## Tips for Reports

1. **For ERD**: Use in Database Design section
2. **For Use Cases**: Use in System Requirements section
3. **For Sequence Diagrams**: Use in System Design/Implementation section
4. **For Architecture**: Use in System Overview section
5. **For Activity Diagram**: Use in Process Flow section
6. **For Class Diagram**: Use in Software Design section
7. **For Deployment**: Use in Deployment Architecture section

## Customization

You can modify any `.puml` file to:
- Change colors: `skinparam` commands
- Add/remove entities or use cases
- Modify relationships
- Add notes and annotations
- Change layout direction

## Export Formats

PlantUML supports multiple formats:
- PNG (best for documents)
- SVG (scalable vector graphics)
- PDF (for printing)
- EPS (for LaTeX documents)

## Example Export Commands

```bash
# Export as PNG
plantuml -tpng erd-diagram.puml

# Export as SVG
plantuml -tsvg usecase-diagram.puml

# Export all diagrams
plantuml *.puml

# Export with custom resolution
plantuml -tpng -DPLANTUML_LIMIT_SIZE=8192 erd-diagram.puml
```

## Need Help?

- PlantUML Documentation: https://plantuml.com/
- PlantUML Syntax: https://plantuml.com/guide
- Color Codes: https://plantuml.com/color
