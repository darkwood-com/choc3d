/**
 * @author Mathieu Ledru
 */

var Choc3D = Choc3D || { VERSION: '1.0' };/**
 * @author Mathieu Ledru
 */

Choc3D.App = function ( container ) {

    this.container = container;

};

Choc3D.App.prototype = {

    constructor: Choc3D.App,

    init: function() {
        // set the scene size
        var width = this.container.width();
        var height = this.container.height();

        // setup renderer
        var renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
        this.container.append(renderer.domElement);

        // setup camera
        var view_angle = 45,
            aspect = width / height,
            near = 0.1,
            far = 10000;

        var camera = new THREE.PerspectiveCamera(view_angle, aspect, near, far);
        camera.position.z = 300;

        //setup scene
        var scene = new THREE.Scene();

        //scene.add(new Choc3D.Plane());
        scene.add(new Choc3D.Ball());

        scene.add(camera);

        var pointLight = new THREE.PointLight( 0xFFFFFF );
        pointLight.position.x = 10;
        pointLight.position.y = 50;
        pointLight.position.z = 130;

        scene.add(pointLight);

        renderer.render(scene, camera);
    }

};/**
 * @author Mathieu Ledru
 */

Choc3D.Ball = function ( geometry, material ) {

    geometry = geometry || new THREE.SphereGeometry(50, 16, 16);
    material = material || new THREE.MeshLambertMaterial({ color: 0xCC0000 });

    THREE.Mesh.call( this, geometry, material );

};

Choc3D.Ball.prototype = Object.create( THREE.Mesh.prototype );
/**
 * @author Mathieu Ledru
 */

Choc3D.Plane = function ( geometry, material ) {

    geometry = geometry || new THREE.SphereGeometry(50, 16, 16);
    material = material || new THREE.MeshLambertMaterial({ color: 0xCC0000 });

    THREE.Mesh.call( this, geometry, material );

};

Choc3D.Plane.prototype = Object.create( THREE.Mesh.prototype );
