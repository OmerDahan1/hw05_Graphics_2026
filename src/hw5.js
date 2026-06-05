import {OrbitControls} from './OrbitControls.js'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
// Set background color
scene.background = new THREE.Color(0x1a1a2e);

// Add lights to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 20, -20);
scene.add(directionalLight);

// Enable shadows
renderer.shadowMap.enabled = true;
directionalLight.castShadow = true;

function degrees_to_radians(degrees) {
  var pi = Math.PI;
  return degrees * (pi/180);
}

// Create bowling lane
function createBowlingLane() {
  // Lane surface - just a simple light maple wood surface
  const laneGeometry = new THREE.BoxGeometry(3.5, 0.2, 60);
  const laneMaterial = new THREE.MeshPhongMaterial({
    color: 0xDEB887,  // Light maple wood color
    shininess: 80
  });
  const lane = new THREE.Mesh(laneGeometry, laneMaterial);
  lane.position.set(0, 0, -30);  // Lane extends from Z=0 (foul line) to Z=-60 (pin end)
  lane.receiveShadow = true;
  scene.add(lane);

  // Note: Lane markings, gutters, approach area, pins, ball, and other elements
  // have been removed. Students will need to implement these features.
  camera.zoom = 2.3; 
  camera.updateProjectionMatrix();

  const approachGeometry = new THREE.BoxGeometry(3.5, 0.2, 15);
  const approachMaterial = new THREE.MeshPhongMaterial({
    color: 0xC4A484, // Subtly different shade from the main lane
    shininess: 40
  });
  const approach = new THREE.Mesh(approachGeometry, approachMaterial);
  approach.position.set(0, 0, 7.5); // Center is at Z = 7.5 so it extends from Z=0 to Z=15
  approach.receiveShadow = true;
  scene.add(approach);

  const foulLineGeom = new THREE.PlaneGeometry(3.5, 0.08);
  const foulLineMat = new THREE.MeshBasicMaterial({ color: 0xe74c3c, side: THREE.DoubleSide });
  const foulLine = new THREE.Mesh(foulLineGeom, foulLineMat);
  foulLine.rotation.x = degrees_to_radians(-90);
  foulLine.position.set(0, 0.101, 0); // Placed slightly above the surface to prevent z-fighting
  scene.add(foulLine);

  const gutterGeometry = new THREE.BoxGeometry(0.4, 0.15, 60);
  const gutterMaterial = new THREE.MeshPhongMaterial({ color: 0x2c3e50, shininess: 20 });
  
  const leftGutter = new THREE.Mesh(gutterGeometry, gutterMaterial);
  leftGutter.position.set(-1.95, -0.05, -30); 
  leftGutter.receiveShadow = true;
  scene.add(leftGutter);

  const rightGutter = new THREE.Mesh(gutterGeometry, gutterMaterial);
  rightGutter.position.set(1.95, -0.05, -30);
  rightGutter.receiveShadow = true;
  scene.add(rightGutter);

  const pinDeckGeom = new THREE.PlaneGeometry(3.5, 5);
  const pinDeckMat = new THREE.MeshPhongMaterial({ color: 0xB8860B, shininess: 50 });
  const pinDeck = new THREE.Mesh(pinDeckGeom, pinDeckMat);
  pinDeck.rotation.x = degrees_to_radians(-90);
  pinDeck.position.set(0, 0.101, -58);
  pinDeck.receiveShadow = true;
  scene.add(pinDeck);

  const dotGeom = new THREE.CircleGeometry(0.04, 16);
  const dotMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
  const dotZPositions = [2.0, 5.0];
  const dotXPositions = [-1.4, -0.7, 0, 0.7, 1.4];

  dotZPositions.forEach(z => {
    dotXPositions.forEach(x => {
      const dot = new THREE.Mesh(dotGeom, dotMat);
      dot.rotation.x = degrees_to_radians(-90);
      dot.position.set(x, 0.102, z);
      scene.add(dot);
    });
  });

  const arrowPositionsX = [-0.9, -0.45, 0, 0.45, 0.9];
  arrowPositionsX.forEach((x, index) => {
    const arrowShape = new THREE.Shape();
    arrowShape.moveTo(0, 0.15);
    arrowShape.lineTo(0.06, -0.15);
    arrowShape.lineTo(-0.06, -0.15);
    arrowShape.lineTo(0, 0.15);

    const arrowGeom = new THREE.ShapeGeometry(arrowShape);
    const arrowMat = new THREE.MeshBasicMaterial({ color: 0x444444, side: THREE.DoubleSide });
    const arrowMesh = new THREE.Mesh(arrowGeom, arrowMat);
    arrowMesh.rotation.x = degrees_to_radians(-90);
    
    // Stagger layout pattern
    const staggerZ = -15 - (2 - Math.abs(2 - index)) * 0.4;
    arrowMesh.position.set(x, 0.102, staggerZ);
    scene.add(arrowMesh);
  });
}

// New function to build pins using Lathe Geometry
function createPins() {
  const points = [];
  points.push(new THREE.Vector2(0.0, 0.0));
  points.push(new THREE.Vector2(0.16, 0.05));
  points.push(new THREE.Vector2(0.22, 0.15));
  points.push(new THREE.Vector2(0.24, 0.35)); // Widest body point
  points.push(new THREE.Vector2(0.18, 0.6));
  points.push(new THREE.Vector2(0.09, 0.85)); // Narrow neck segment
  points.push(new THREE.Vector2(0.08, 0.95));
  points.push(new THREE.Vector2(0.11, 1.12)); // Flaring head segment
  points.push(new THREE.Vector2(0.09, 1.22));
  points.push(new THREE.Vector2(0.0, 1.25));  // Domed peak top (~1.25 units tall)

  const pinGeometry = new THREE.LatheGeometry(points, 24);
  const pinMaterial = new THREE.MeshPhongMaterial({ color: 0xFAFAFA, shininess: 100 });

  // Secondary geometry for the red stripe around the neck area
  const stripeGeom = new THREE.CylinderGeometry(0.092, 0.085, 0.1, 24);
  const stripeMat = new THREE.MeshBasicMaterial({ color: 0xd32f2f });

  // Exact coordinates from instructions
  const pinCoordinates = [
    { x:  0.0,  z: -57.000 }, // Pin 1
    { x: -0.5,  z: -57.866 }, // Pin 2
    { x:  0.5,  z: -57.866 }, // Pin 3
    { x: -1.0,  z: -58.732 }, // Pin 4
    { x:  0.0,  z: -58.732 }, // Pin 5
    { x:  1.0,  z: -58.732 }, // Pin 6
    { x: -1.5,  z: -59.598 }, // Pin 7
    { x: -0.5,  z: -59.598 }, // Pin 8
    { x:  0.5,  z: -59.598 }, // Pin 9
    { x:  1.5,  z: -59.598 }  // Pin 10
  ];

  pinCoordinates.forEach(coord => {
    const pinGroup = new THREE.Group();
    
    const pinMesh = new THREE.Mesh(pinGeometry, pinMaterial);
    pinMesh.castShadow = true;
    pinMesh.receiveShadow = true;
    pinGroup.add(pinMesh);

    const neckStripe = new THREE.Mesh(stripeGeom, stripeMat);
    neckStripe.position.y = 0.92; // Position stripe right at the neck height
    pinGroup.add(neckStripe);

    pinGroup.position.set(coord.x, 0.1, coord.z); // Offset slightly in Y due to lane depth
    scene.add(pinGroup);
  });
}

// New function to build the static bowling ball with finger holes
function createBowlingBall() {
  const ballGroup = new THREE.Group();
  const ballRadius = 0.45; // Diameter ~0.9 units
  
  const ballGeom = new THREE.SphereGeometry(ballRadius, 32, 32);
  const ballMat = new THREE.MeshPhongMaterial({ color: 0x1c2d42, shininess: 180, specular: 0x333333 });
  
  const ballMesh = new THREE.Mesh(ballGeom, ballMat);
  ballMesh.castShadow = true;
  ballMesh.receiveShadow = true;
  ballGroup.add(ballMesh);

  // Finger holes (small dark cylinders embedded slightly into the surface)
  const holeGeom = new THREE.CylinderGeometry(0.03, 0.03, 0.08, 16);
  const holeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });

  const thumbHole = new THREE.Mesh(holeGeom, holeMat);
  thumbHole.position.set(0, 0.28, 0.3);
  thumbHole.rotation.x = degrees_to_radians(45);
  ballGroup.add(thumbHole);

  const fingerHoleLeft = new THREE.Mesh(holeGeom, holeMat);
  fingerHoleLeft.position.set(-0.07, 0.38, 0.15);
  fingerHoleLeft.rotation.x = degrees_to_radians(25);
  ballGroup.add(fingerHoleLeft);

  const fingerHoleRight = new THREE.Mesh(holeGeom, holeMat);
  fingerHoleRight.position.set(0.07, 0.38, 0.15);
  fingerHoleRight.rotation.x = degrees_to_radians(25);
  ballGroup.add(fingerHoleRight);

  // Positioned statically on the approach area, centered on the lane
  ballGroup.position.set(0, ballRadius + 0.1, 5.0); 
  scene.add(ballGroup);
}
// Create all elements
createBowlingLane();
createPins();    
createBowlingBall();  

// Set camera position for bowler's perspective
const cameraTranslate = new THREE.Matrix4();
cameraTranslate.makeTranslation(0, 5, 12);
camera.applyMatrix4(cameraTranslate);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
let isOrbitEnabled = true;

// Instructions display
const instructionsElement = document.createElement('div');
instructionsElement.style.position = 'absolute';
instructionsElement.style.bottom = '20px';
instructionsElement.style.left = '20px';
instructionsElement.style.color = 'white';
instructionsElement.style.fontSize = '16px';
instructionsElement.style.fontFamily = 'Arial, sans-serif';
instructionsElement.style.textAlign = 'left';
instructionsElement.innerHTML = `
  <h3>Bowling Alley Controls:</h3>
  <p>O - Toggle orbit camera</p>
`;
document.body.appendChild(instructionsElement);

// Handle key events
function handleKeyDown(e) {
  if (e.key === "o") {
    isOrbitEnabled = !isOrbitEnabled;
  }
}

document.addEventListener('keydown', handleKeyDown);

// Animation function
function animate() {
  // camera.position.set(0, 1.5, -53); // Places camera right in front of the pins
  // if (typeof controls !== 'undefined' && controls) {
  //     controls.target.set(0, 0.5, -57); // Forces focus on the head pin
  //     controls.update();
  // }
  requestAnimationFrame(animate);

  // Update controls
  controls.enabled = isOrbitEnabled;
  controls.update();

  renderer.render(scene, camera);
}

animate();

window.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'o') {
        if (typeof controls !== 'undefined' && controls) {
            controls.target.set(0, 0.5, -57); // Shifts zoom target to the pins
            controls.update();                // Instantly updates the camera
        }
    }
});