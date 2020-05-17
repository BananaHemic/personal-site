$(document).ready(function() {
var camera, scene, renderer, frustrum, projScreenMatrix;
var container, starSystem, starSystemGeom;
var numStars = 700;
var spreadX = 10000;
var spreadY = 2000;
var spreadZ = 10;
var minX = 300;
var minY = 300;
var centerSpacingX = 130;
var centerSpacingY = 40;
var startingZ = 600;
var container_h = 0.9;
var particleSize = 10;
var particleVelZ = 400;
var maxDt = 1 / 10;
var clock = new THREE.Clock();
const glcontainerID = 'glcanvas';
const glcontainer = '#glcanvas';
var isElemVisible = true;

init();
animate();

function init() {
  container = document.getElementById(glcontainerID);
  var w = Math.round($(glcontainer).width());
  var h = Math.round($(glcontainer).height());
 
  camera = new THREE.PerspectiveCamera(75, w / h, 1, 7000);
  camera.position.z = startingZ;
  scene = new THREE.Scene();
  frustum = new THREE.Frustum();
  projScreenMatrix = new THREE.Matrix4();
  updateFrustum();
  starSystemGeom = new THREE.Geometry();
  addStars();

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(w, h)
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);
  // Save some performance, and only play webGL when visible
  var observer = new IntersectionObserver(function(entries) {
    isElemVisible = entries[0].isIntersecting;
    if(isElemVisible)
      console.log('Element is fully visible in screen');
    else
      console.log('Element not visible');
  }, { threshold: [0] });
  observer.observe(document.querySelector(glcontainer));

  window.addEventListener('resize', onWindowResize, false);
  console.log('If you\'re reading this, tell future me that I said hello');
}
function addStars() {
  for (var i=0; i < numStars; i++) {
    starSystemGeom.vertices.push(new THREE.Vector3(0,0,0));
    setInitialPosition(starSystemGeom.vertices[i]);
  }
  
  var particleMat = new THREE.PointsMaterial({
        color: 0xEEEEEE,
        size: particleSize
      });

  starSystem = new THREE.Points(
    starSystemGeom,
    particleMat
  );
  scene.add(starSystem);
}
function setInitialPosition(pos){
  pos.x = Math.random() * spreadX - spreadX / 2 + minX;
  pos.y = Math.random() * spreadY - spreadY / 2 + minY;
  pos.z = (Math.random() - 0.5) * spreadZ;
  if (Math.abs(pos.x) < centerSpacingX
    && Math.abs(pos.y) < centerSpacingY) {
    pos.x += Math.sign(pos.x) * centerSpacingX;
    pos.y += Math.sign(pos.y) * centerSpacingY;
  }
}
function onWindowResize() {
  var w = Math.round($(glcontainer).width());
  var h = Math.round($(glcontainer).height());
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  updateFrustum();
}
function animate() {
  dt = clock.getDelta();
  dt = Math.min(dt, maxDt);
  requestAnimationFrame(animate);
  if(!isElemVisible)
    return;
  //for each particles, moveStar it
  for(var i = 0; i < starSystem.geometry.vertices.length; i++){
    moveStar(starSystemGeom.vertices[i], i, dt);
  }
  starSystem.geometry.verticesNeedUpdate = true;
  renderer.render(scene, camera);
}
function moveStar(position, index, dt) {
    if (isVisible(position)) {
      position.z += particleVelZ * dt;
    } else {
      setInitialPosition(position);
    }
}
function isVisible(position) {
  return frustum.containsPoint(position);
}
function updateFrustum(){
  camera.updateMatrix();
  camera.updateMatrixWorld();
  projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  frustum.setFromProjectionMatrix( new THREE.Matrix4().multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse ) );
}
})
