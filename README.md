# MinerSVGA - Web Edition

A web-based version of the classic mining game, converted from the original Pygame implementation. Dig for minerals, buy equipment, and find the ring to win!

## How to Run

1. **Simple Method**: Just open `index.html` in your web browser
2. **Local Server** (recommended): 
   - Use a local web server like Python's built-in server:
     ```bash
     python -m http.server 8000
     ```
   - Then open `http://localhost:8000` in your browser

## Game Overview

You are a miner trying to make your fortune! Your goal is to:
1. Find the hidden ring deep in the mine
2. Accumulate $20,000 in money
3. Return to town to marry Mimi and win the game

## How to Play

### Town Interface
- **Equipment**: Click on equipment items or use number keys 1-7 to buy tools
- **Bank**: Click "Bank" or press 'B' to sell your minerals
- **Hospital**: Click "Hospital" or press 'H' to heal (costs money)
- **Saloon**: Click "Saloon" or press 'S' for entertainment options
- **Enter Mine**: Click "Enter Mine" or press 'E' to go mining ($30 cost)

### Mining Interface
- **Movement**: Use arrow keys to move and dig
- **Teleport**: Press 'T' to teleport back to the surface
- **Return to Town**: Press 'Escape' to return to town

### Equipment
- **Shovel ($100)**: Reduces dig cost by 12
- **Pick ($150)**: Reduces dig cost by 5
- **Drill ($250)**: Allows digging through granite
- **Lantern ($300)**: Reveals unknown tiles
- **Bucket ($200)**: Removes water tiles
- **Torch ($100)**: Helps find hidden treasures
- **Dynamite ($300)**: Explodes large areas

### Minerals & Tiles
- **Silver**: Common mineral, moderate value
- **Gold**: Valuable mineral
- **Platinum**: Very valuable mineral
- **Diamonds**: Extremely valuable, rare
- **Granite**: Hard rock, requires drill
- **Water**: Requires bucket to remove
- **Spring**: Floods area when dug, causes damage
- **Ring**: The goal! Find this to win

### Game Mechanics
- **Health**: You start with 100% health
- **Money**: You start with $1,500
- **Digging Costs**: Each tile type has different dig costs
- **Cave-ins**: Random events that damage you and fill areas
- **Market Rates**: Mineral prices fluctuate randomly

### Win/Lose Conditions
- **Win**: Have the ring AND $20,000 or more
- **Lose**: Health reaches 0% OR money goes below -$100

## Tips
1. Start by buying a shovel to reduce digging costs
2. Save money for a drill to access granite areas
3. Use the lantern to see what you're digging
4. Be careful with springs - they can flood your path
5. The ring is usually found deep in the mine
6. Regular trips to the bank to sell minerals are important

## Technical Details

This web version maintains all the original game mechanics from the Pygame version:
- Same tile generation algorithm
- Same equipment and mineral systems
- Same win/lose conditions
- Same random events (cave-ins, springs)

The game uses:
- HTML5 Canvas for rendering
- Vanilla JavaScript for game logic
- CSS for modern UI styling
- No external dependencies required

## Browser Compatibility

Works in all modern browsers that support:
- HTML5 Canvas
- ES6 JavaScript features
- CSS Grid and Flexbox

## Original Game

This is a web conversion of the original Pygame mining game. The original game was a tribute to classic mining games like Motherload, featuring similar mechanics and gameplay elements.

Enjoy mining!
