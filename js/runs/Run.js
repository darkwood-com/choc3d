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
    this.control.maxDistance = 4;
    this.control.addEventListener('change', function() {
        me.choc3d.light.position.copy(me.choc3d.camera.position);
    });

    this.data = {
        rotation: '',
        zoom: '',
        material: function() {},
        background: function() {

            var objects = {
                'none': function() {
                    return null;
                },
                'sky': function() {
                    var skyGeo = new THREE.SphereGeometry( 4000, 32, 15 );
                    var skyMat = new THREE.ShaderMaterial( {
                        vertexShader: THREE.SkyShader.vertexShader,
                        fragmentShader: THREE.SkyShader.fragmentShader,
                        uniforms: THREE.SkyShader.uniforms,
                        side: THREE.BackSide
                    } );

                    return new THREE.Mesh( skyGeo, skyMat );
                }
            };

            var background = null;
            var backgrounds = {};
            for(var name in objects) {
                backgrounds[name] = (function(name) {
                    return function() {
                        if(background) me.choc3d.scene.remove(background);
                        background = objects[name]();
                        if(background) me.choc3d.scene.add(background);
                    };
                })(name);
            }

            return backgrounds;
        },
        ground: function() {

            var objects = {
                'none': function() {
                    return null;
                },
                'earth': function() {
                    var groundGeo = new THREE.PlaneGeometry( 10000, 10000 );
                    var groundMat = new THREE.MeshPhongMaterial( { ambient: 0xffffff, color: 0xffffff, specular: 0x050505 } );
                    groundMat.color.setHSV( 0.095, 0.5, 1 );

                    var ground = new THREE.Mesh( groundGeo, groundMat );
                    ground.rotation.x = -Math.PI/2;
                    ground.position.y = -0.75;

                    return ground;
                }
            };

            var ground = null;
            var grounds = {};
            for(var name in objects) {
                grounds[name] = (function(name) {
                    return function() {
                        if(ground) me.choc3d.scene.remove(ground);
                        ground = objects[name]();
                        if(ground) me.choc3d.scene.add(ground);
                    };
                })(name);
            }

            return grounds;
        },
        lights: function() {

            var objects = {
                'default': function() {
                    return null;
                },
                'directional': function() {
                    var directional = new THREE.DirectionalLight( 0xffffff, 0.5 );
                    directional.position.set( -1, 1.75, 1 );
                    directional.position.multiplyScalar( 50 );

                    return directional;
                }
            };

            var light = null;
            var lights = {};
            for(var name in objects) {
                lights[name] = (function(name) {
                    return function() {
                        if(light) me.choc3d.scene.remove(light);
                        light = objects[name]();
                        if(light) me.choc3d.scene.add(light);
                        me.choc3d.scene.traverse(function(object) {
                            if( object instanceof THREE.Mesh ) {
                                object.material.needsUpdate = true;
                            }
                        });
                    };
                })(name);
            }

            return lights;
        }
    };

    var gui = new dat.GUI(), folder, name, property;
    folder = gui.addFolder('Scene');
    folder.add(this.data, 'rotation').listen();
    folder.add(this.data, 'zoom').listen();
    folder.open();
    folder = gui.addFolder('Material');
    folder.add(this.data, 'material');
    folder.open();
    folder = gui.addFolder('Background');
    var backgrounds = this.data.background();
    for(name in backgrounds) {
        property = 'background_' + name;
        this.data[property] = backgrounds[name];
        folder.add(this.data, property).name(name);
    }
    folder.open();
    folder = gui.addFolder('Grounds');
    var grounds = this.data.ground();
    for(name in grounds) {
        property = 'ground_' + name;
        this.data[property] = grounds[name];
        folder.add(this.data, property).name(name);
    }
    folder.open();
    folder = gui.addFolder('Lights');
    var lights = this.data.lights();
    for(name in lights) {
        property = 'light_' + name;
        this.data[property] = lights[name];
        folder.add(this.data, property).name(name);
    }
    folder.open();

    this.reshape();
};

Choc3D.Run.prototype = {

    constructor: Choc3D.Run,

    animate:function (dt) {

        this.update(dt);
        this.render();

    },

    update: function (dt) {
        var zoom = new THREE.Vector3();
        zoom.sub(this.control.center, this.choc3d.camera.position);
        this.data.rotation = this.sprintf(this.choc3d.camera.rotation);
        this.data.zoom = this.sprintf(zoom.length());

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