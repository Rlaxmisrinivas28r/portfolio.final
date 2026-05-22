/**
 * Personal Portfolio - Holographic 3D Developer Office Background
 * Powered by Three.js (No heavy asset loads, 100% vector-sharp graphics, 0% blur)
 */

(function () {
    'use strict';

    if (typeof THREE === 'undefined') {
        console.error('Three.js is not loaded. 3D Office background disabled.');
        return;
    }

    // --- Configurations & State ---
    const canvas = document.getElementById('bg-canvas');
    let scene, camera, renderer;
    let officeGroup; // Hold all 3D office meshes
    let gridHelper;
    let dataColumns = []; // Hold scrolling particle columns (cyber code streams)

    // Mouse coordinates (Normalized: -1 to 1)
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const windowHalf = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    // Scroll metrics
    let scrollPercent = 0;
    let targetScrollPercent = 0;

    // Materials for the Glowing Blueprint/Hologram Style
    let neonCyanMaterial, neonPurpleMaterial, neonBlueMaterial, glassMaterial;

    // --- Initialization ---
    function init() {
        // 1. Scene & Fog Setup (Ensures depth fades beautifully)
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x04050d, 0.0022);

        // 2. Camera Setup (Wide Field of view for cinematic feel)
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1200);
        // Base Hero view position
        camera.position.set(0, 90, 270);

        // 3. Renderer Setup (Sharp rendering parameters)
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true,
            powerPreference: "high-performance"
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // High-DPI support
        renderer.setSize(window.innerWidth, window.innerHeight);

        // 4. Initialize Core Materials
        initMaterials();

        // 5. Build 3D Holographic Office
        buildHolographicOffice();

        // 6. Build Background Matrix Code Columns
        buildMatrixColumns();

        // 7. Event Listeners
        window.addEventListener('resize', onWindowResize, false);
        document.addEventListener('mousemove', onMouseMove, false);
        window.addEventListener('scroll', onWindowScroll, { passive: true });

        // 8. Start Loop
        animate();
    }

    // --- Core Hologram Materials ---
    function initMaterials() {
        // Glowing cyan lines
        neonCyanMaterial = new THREE.LineBasicMaterial({
            color: 0x00f2fe,
            transparent: true,
            opacity: 0.65,
            linewidth: 1.5 // Note: Windows browsers typically default to 1.0, wireframes look super crisp
        });

        // Glowing purple lines
        neonPurpleMaterial = new THREE.LineBasicMaterial({
            color: 0x9d4edd,
            transparent: true,
            opacity: 0.55,
            linewidth: 1.0
        });

        // Glowing blue highlights
        neonBlueMaterial = new THREE.LineBasicMaterial({
            color: 0x3b82f6,
            transparent: true,
            opacity: 0.5,
            linewidth: 1.0
        });

        // Transparent glass panel material
        glassMaterial = new THREE.MeshBasicMaterial({
            color: 0x0a0c1e,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide
        });
    }

    // --- Build 3D Holographic Desk & Setup ---
    function buildHolographicOffice() {
        officeGroup = new THREE.Group();
        // Lower the entire office setup slightly for better aesthetic layout centering
        officeGroup.position.y = -20;

        // A. FLOOR GRID (Interactive glowing digital carpet)
        gridHelper = new THREE.GridHelper(1000, 50, 0x9d4edd, 0x0a0c1e);
        gridHelper.position.y = 0;
        gridHelper.material.opacity = 0.25;
        gridHelper.material.transparent = true;
        officeGroup.add(gridHelper);

        // B. DESK SETUP
        // Glass Desktop plane
        const deskGeom = new THREE.BoxGeometry(220, 4, 110);
        const deskMesh = new THREE.Mesh(deskGeom, glassMaterial);
        deskMesh.position.set(0, 40, 0);
        
        // Desk edges wireframe outline
        const deskEdges = new THREE.EdgesGeometry(deskGeom);
        const deskWireframe = new THREE.LineSegments(deskEdges, neonCyanMaterial);
        deskWireframe.position.copy(deskMesh.position);
        officeGroup.add(deskMesh);
        officeGroup.add(deskWireframe);

        // Desk Legs (Four sleek glowing columns)
        const legGeom = new THREE.BoxGeometry(6, 40, 6);
        const legOffsets = [
            [-100, 20, -45],
            [100, 20, -45],
            [-100, 20, 45],
            [100, 20, 45]
        ];

        legOffsets.forEach(pos => {
            const leg = new THREE.Mesh(legGeom, glassMaterial);
            leg.position.set(pos[0], pos[1], pos[2]);
            const legEdges = new THREE.EdgesGeometry(legGeom);
            const legWire = new THREE.LineSegments(legEdges, neonPurpleMaterial);
            legWire.position.copy(leg.position);
            officeGroup.add(leg);
            officeGroup.add(legWire);
        });

        // C. CENTRAL WORKSTATION: DUAL MONITORS
        // 1. Center Main Monitor
        const screenWidth = 64, screenHeight = 36, screenThickness = 2;
        const mainScreenGeom = new THREE.BoxGeometry(screenWidth, screenHeight, screenThickness);
        const mainScreen = new THREE.Mesh(mainScreenGeom, glassMaterial);
        mainScreen.position.set(0, 68, -25);
        const mainEdges = new THREE.EdgesGeometry(mainScreenGeom);
        const mainWire = new THREE.LineSegments(mainEdges, neonCyanMaterial);
        mainWire.position.copy(mainScreen.position);
        officeGroup.add(mainScreen);
        officeGroup.add(mainWire);

        // Screen Stand Column
        const standGeom = new THREE.BoxGeometry(6, 20, 4);
        const stand = new THREE.Mesh(standGeom, glassMaterial);
        stand.position.set(0, 50, -25);
        const standEdges = new THREE.EdgesGeometry(standGeom);
        const standWire = new THREE.LineSegments(standEdges, neonPurpleMaterial);
        standWire.position.copy(stand.position);
        officeGroup.add(stand);
        officeGroup.add(standWire);

        // Screen Base Plate
        const baseGeom = new THREE.BoxGeometry(24, 2, 16);
        const base = new THREE.Mesh(baseGeom, glassMaterial);
        base.position.set(0, 41, -23);
        const baseEdges = new THREE.EdgesGeometry(baseGeom);
        const baseWire = new THREE.LineSegments(baseEdges, neonPurpleMaterial);
        baseWire.position.copy(base.position);
        officeGroup.add(base);
        officeGroup.add(baseWire);

        // 2. Left Angled Monitor (Cyber IDE layout)
        const leftScreen = new THREE.Mesh(mainScreenGeom, glassMaterial);
        leftScreen.position.set(-62, 68, -12);
        leftScreen.rotation.y = Math.PI / 7; // Rotated slightly inward
        const leftEdges = new THREE.EdgesGeometry(mainScreenGeom);
        const leftWire = new THREE.LineSegments(leftEdges, neonBlueMaterial);
        leftWire.position.copy(leftScreen.position);
        leftWire.rotation.copy(leftScreen.rotation);
        officeGroup.add(leftScreen);
        officeGroup.add(leftWire);

        // Left Stand
        const leftStand = new THREE.Mesh(standGeom, glassMaterial);
        leftStand.position.set(-60, 50, -15);
        leftStand.rotation.y = Math.PI / 7;
        const leftStandEdges = new THREE.EdgesGeometry(standGeom);
        const leftStandWire = new THREE.LineSegments(leftStandEdges, neonPurpleMaterial);
        leftStandWire.position.copy(leftStand.position);
        leftStandWire.rotation.copy(leftStand.rotation);
        officeGroup.add(leftStand);
        officeGroup.add(leftStandWire);

        // D. WORKSTATION INPUTS
        // Keyboard (Low poly grid layout)
        const kbGeom = new THREE.BoxGeometry(40, 2, 14);
        const kb = new THREE.Mesh(kbGeom, glassMaterial);
        kb.position.set(0, 42.5, 12);
        const kbEdges = new THREE.EdgesGeometry(kbGeom);
        const kbWire = new THREE.LineSegments(kbEdges, neonCyanMaterial);
        kbWire.position.copy(kb.position);
        officeGroup.add(kb);
        officeGroup.add(kbWire);

        // Angled Laptop (On the right side of the desk)
        const laptopBaseGeom = new THREE.BoxGeometry(32, 1.5, 22);
        const laptopBase = new THREE.Mesh(laptopBaseGeom, glassMaterial);
        laptopBase.position.set(70, 42, 10);
        laptopBase.rotation.y = -Math.PI / 8;
        const laptopBaseEdges = new THREE.EdgesGeometry(laptopBaseGeom);
        const laptopBaseWire = new THREE.LineSegments(laptopBaseEdges, neonPurpleMaterial);
        laptopBaseWire.position.copy(laptopBase.position);
        laptopBaseWire.rotation.copy(laptopBase.rotation);
        officeGroup.add(laptopBase);
        officeGroup.add(laptopBaseWire);

        const laptopScreenGeom = new THREE.BoxGeometry(32, 22, 1.5);
        const laptopScreen = new THREE.Mesh(laptopScreenGeom, glassMaterial);
        laptopScreen.position.set(65, 52, 4);
        laptopScreen.rotation.y = -Math.PI / 8;
        laptopScreen.rotation.x = -Math.PI / 24; // Opened back slightly
        const laptopScreenEdges = new THREE.EdgesGeometry(laptopScreenGeom);
        const laptopScreenWire = new THREE.LineSegments(laptopScreenEdges, neonCyanMaterial);
        laptopScreenWire.position.copy(laptopScreen.position);
        laptopScreenWire.rotation.copy(laptopScreen.rotation);
        officeGroup.add(laptopScreen);
        officeGroup.add(laptopScreenWire);

        // E. ACCESSORIES (Holographic details)
        // Coffee Cup Outline
        const cupGeom = new THREE.CylinderGeometry(4, 3, 9, 8);
        const cup = new THREE.Mesh(cupGeom, glassMaterial);
        cup.position.set(-36, 45, 14);
        const cupEdges = new THREE.EdgesGeometry(cupGeom);
        const cupWire = new THREE.LineSegments(cupEdges, neonBlueMaterial);
        cupWire.position.copy(cup.position);
        officeGroup.add(cup);
        officeGroup.add(cupWire);

        // Floating Server / Mainframe Tower on the Floor Grid
        const serverGeom = new THREE.BoxGeometry(26, 48, 48);
        const server = new THREE.Mesh(serverGeom, glassMaterial);
        server.position.set(-90, 24, -20);
        const serverEdges = new THREE.EdgesGeometry(serverGeom);
        const serverWire = new THREE.LineSegments(serverEdges, neonPurpleMaterial);
        serverWire.position.copy(server.position);
        officeGroup.add(server);
        officeGroup.add(serverWire);

        // Add constructed group to the main scene
        scene.add(officeGroup);
    }

    // --- Build Scrolling Background Data Matrix Columns ---
    function buildMatrixColumns() {
        const columnCount = 28;
        
        for (let i = 0; i < columnCount; i++) {
            // Distribute columns horizontally behind the office desk
            const x = (Math.random() - 0.5) * 800;
            const z = -150 - Math.random() * 250;
            const pointsCount = 15 + Math.floor(Math.random() * 25);
            
            const positions = [];
            const speeds = [];
            
            const topY = 250 + Math.random() * 150;
            const gap = 12;

            for (let j = 0; j < pointsCount; j++) {
                positions.push(x, topY - (j * gap), z);
            }

            const pointsGeom = new THREE.BufferGeometry();
            pointsGeom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

            // Custom small glowing point materials
            const pointsMat = new THREE.PointsMaterial({
                color: Math.random() > 0.5 ? 0x00f2fe : 0x9d4edd,
                size: 2.0 + Math.random() * 2.5,
                transparent: true,
                opacity: 0.35 + Math.random() * 0.4,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

            const points = new THREE.Points(pointsGeom, pointsMat);
            scene.add(points);

            // Store individual velocity coordinates
            dataColumns.push({
                mesh: points,
                speed: 1.2 + Math.random() * 2.5,
                initialY: topY,
                gap: gap,
                length: pointsCount
            });
        }
    }

    // --- Event Listeners & Adapters ---
    function onWindowResize() {
        windowHalf.x = window.innerWidth / 2;
        windowHalf.y = window.innerHeight / 2;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function onMouseMove(event) {
        // Track coordinate coordinates between -1.0 and 1.0
        mouse.targetX = (event.clientX - windowHalf.x) / windowHalf.x;
        mouse.targetY = (event.clientY - windowHalf.y) / windowHalf.y;
    }

    function onWindowScroll() {
        const scrollY = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (maxScroll > 0) {
            targetScrollPercent = scrollY / maxScroll;
        }
    }

    // --- Animation & Physics Engine Loop ---
    function animate() {
        requestAnimationFrame(animate);
        render();
    }

    function render() {
        const time = Date.now() * 0.001;

        // 1. Slow, micro breathing oscillation of the Office components
        if (officeGroup) {
            officeGroup.position.y = -20 + Math.sin(time * 0.5) * 2;
            officeGroup.rotation.y = Math.sin(time * 0.15) * 0.02;
        }

        // 2. Animate Background Cyber Code Columns (Falling downwards)
        dataColumns.forEach(col => {
            const positions = col.mesh.geometry.attributes.position.array;
            
            for (let i = 0; i < col.length; i++) {
                const index = i * 3 + 1; // target Y coordinate
                positions[index] -= col.speed;
                
                // Wrap around when Y goes too low
                if (positions[index] < -200) {
                    positions[index] = col.initialY;
                }
            }
            col.mesh.geometry.attributes.position.needsUpdate = true;
        });

        // 3. Interpolate Scroll Percentage (Creates a super smooth camera transition lag)
        scrollPercent += (targetScrollPercent - scrollPercent) * 0.08;

        // 4. Smooth Mouse Panning Parallax Coordinate Lerps
        mouse.x += (mouse.targetX - mouse.x) * 0.08;
        mouse.y += (mouse.targetY - mouse.y) * 0.08;

        // 5. DYNAMIC SCROLL CAMERA PATHWAY SYSTEM
        // Coordinates and rotation vectors interpolate perfectly depending on scroll location
        if (scrollPercent < 0.25) {
            // --- HERO SECTION (Front facing epic blueprint) ---
            const t = scrollPercent / 0.25;
            camera.position.x = THREE.MathUtils.lerp(0, 110, t);
            camera.position.y = THREE.MathUtils.lerp(90, 75, t);
            camera.position.z = THREE.MathUtils.lerp(270, 210, t);
        } else if (scrollPercent < 0.5) {
            // --- ABOUT SECTION (Side perspective focusing desk items) ---
            const t = (scrollPercent - 0.25) / 0.25;
            camera.position.x = THREE.MathUtils.lerp(110, 0, t);
            camera.position.y = THREE.MathUtils.lerp(75, 230, t);
            camera.position.z = THREE.MathUtils.lerp(210, 150, t);
        } else if (scrollPercent < 0.75) {
            // --- SKILLS SECTION (High angle structural birds-eye schematic) ---
            const t = (scrollPercent - 0.5) / 0.25;
            camera.position.x = THREE.MathUtils.lerp(0, -60, t);
            camera.position.y = THREE.MathUtils.lerp(230, 60, t);
            camera.position.z = THREE.MathUtils.lerp(150, 80, t);
        } else {
            // --- PROJECTS & CONTACTS (Zoom cinematic monitor-cut look and pull-out panoramic) ---
            const t = (scrollPercent - 0.75) / 0.25;
            camera.position.x = THREE.MathUtils.lerp(-60, -140, t);
            camera.position.y = THREE.MathUtils.lerp(60, 150, t);
            camera.position.z = THREE.MathUtils.lerp(80, 260, t);
        }

        // Apply mouse coordinates to camera position for minor persistent parallax tilt
        camera.position.x += mouse.x * 20;
        camera.position.y += -mouse.y * 15;

        // Camera always focuses on center desk cluster to keep scene oriented correctly
        const targetFocus = new THREE.Vector3(0, 25, 0);
        camera.lookAt(targetFocus);

        // 6. Draw Frame
        renderer.render(scene, camera);
    }

    // Run Initialization when DOM is loaded
    document.addEventListener('DOMContentLoaded', init);

})();
