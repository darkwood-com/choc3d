/**
 * @author Mathieu Ledru
 */

Choc3D.Run = function(container) {

    var me = this;

    this.container = container;

    this.stats = new Stats();
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.left = '0px';
    this.stats.domElement.style.top = '0px';
    this.container.appendChild(this.stats.domElement);

    this.choc3d = new Choc3D.App();
    this.container.appendChild(this.choc3d.renderer.domElement);

    this.control = new THREE.OrbitControls(this.choc3d.camera);
    this.control.autoRotate = true;
    this.control.minDistance = 1;
    this.control.maxDistance = 3;
    this.control.addEventListener('change', function() {
        me.choc3d.light.position.copy(me.choc3d.camera.position);
    });

    var FizzyText = function() {
        this.rotation = '';
        this.zoom = '';
    };
    this.text = new FizzyText();
    var gui = new dat.GUI();
    gui.add(this.text, 'rotation').listen();
    gui.add(this.text, 'zoom').listen();

    this.zoom = new THREE.Vector3();

    this.reshape();
};

Choc3D.Run.prototype = {

    constructor: Choc3D.Run,

    animate:function (dt) {

        this.update(dt);
        this.render();

    },

    update: function (dt) {
        this.zoom.sub(this.control.center, this.choc3d.camera.position);
        this.text.rotation = this.sprintf(this.choc3d.camera.rotation);
        this.text.zoom = this.sprintf(this.zoom.length());

        this.stats.update();
        this.control.update();
        this.choc3d.update(dt);
    },

    render: function () {
        this.choc3d.render();
    },

    reshape: function () {
        var width = this.container.offsetWidth;
        var height = this.container.offsetHeight;

        this.choc3d.reshape(width, height);
    },

    sprintf: function(data) {
        function round(num, dec) {
            return Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
        }

        if( data instanceof THREE.Vector3 ) {
            return '( ' + round(data.x, 2) + ', ' + round(data.y, 2) + ', ' + round(data.z, 2) + ' )';
        } else if ((typeof(data) === 'number' || typeof(data) === 'string') && data !== '' && !isNaN(data)) {
            return round(data, 2);
        }

        return data;
    }

};