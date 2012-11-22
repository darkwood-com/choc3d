/**
 * @author Mathieu Ledru
 */

Choc3D.App = function() {

    this.renderer = new THREE.WebGLRenderer();
    this.scene = new Choc3D.Choc3DScene();
    this.camera = new THREE.PerspectiveCamera();
    this.light = new THREE.PointLight( 0xFFFFFF );

};

Choc3D.App.prototype = {

    constructor: Choc3D.App,

    init: function()
    {
        this.camera.position.z = 2;

        this.scene.add(this.camera);

        this.light.position.copy(this.camera.position);
        this.scene.add(this.light);
    },

    reshape: function(width, height)
    {
        var view_angle = 45,
            aspect = width / height,
            near = 0.1,
            far = 10000;

        this.camera.projectionMatrix.makePerspective(view_angle, aspect, near, far);
        this.renderer.setSize(width, height);
    },

    render: function()
    {
        this.renderer.render(this.scene, this.camera);
    },

    update: function(dt)
    {
        this.scene.update(dt);
    }

};