const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: "#87CEEB",
    physics: { default: 'arcade' },
    scene: [BootScene, MainScene],
  };
  
  const game = new Phaser.Game(config);
  
  // Escalar el canvas cuando cambie el tamaño de la ventana
  window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
  });
  
  class BootScene extends Phaser.Scene {
    constructor() {
      super({ key: 'BootScene' });
    }
  
    preload() {
      // Cargar imágenes, sprites y audio
      this.load.spritesheet('duck', '/static/img/duck.png',{ frameWidth: 37, frameHeight: 33 });
      this.load.image('duck_fall', '/static/img/duck_fall.png');
      this.load.image('duck_hunted', '/static/img/duck_hunted.png');
      this.load.image('background', '/static/img/level1.png');
      this.load.image('dog_celebrate', '/static/img/dog_celebrate.png');
      this.load.image('dog_hunt', '/static/img/hunt.png');
      this.load.spritesheet('dog_mock', '/static/img/dog_mock.png', { frameWidth: 32, frameHeight: 32 });  //Burla
      this.load.audio('gunshot', '/static/img/gunshot.mp3');
    }
  
    create() {
      // Iniciar la escena principal
      this.scene.start('MainScene');
    }
  }
  
  class MainScene extends Phaser.Scene {
    constructor() {
      super({ key: 'MainScene' });
    }
  
    create() {
      // Fondo
      this.add.image(0, 0, 'background').setOrigin(0).setDisplaySize(this.scale.width, this.scale.height);
  
      // Animaciones del perro
      this.anims.create({
        key: 'mock',
        frames: this.anims.generateFrameNumbers('dog_mock', { start: 0, end: 1 }),
        frameRate: 10,
        repeat: -1,
      });
  
      this.anims.create({
        key: 'duck',
        frames: this.anims.generateFrameNumbers('duck', { start: 0, end: 2 }),
        frameRate: 10,
        repeat: -1,
      });
  
      // Perro
      this.dog = this.add.sprite(200, this.scale.height - 100, 'dog_celebrate');
      this.dog.setOrigin(0.5, 1).setScale(2).setVisible(false);
  
      // Pato
      this.duck = this.physics.add.sprite(100, 100, 'duck').setInteractive();
      this.duck.setVelocity(Phaser.Math.Between(100, 200), Phaser.Math.Between(100, 200));
      this.duck.setCollideWorldBounds(true).setBounce(1);
  
      // Interactividad
      this.input.on('pointerdown', this.shoot, this);
  
      // Sistema de puntuación
      this.score = 0;
      this.misses = 0;
      this.scoreText = this.add.text(10, 10, `Score: ${this.score}`, { fontSize: '32px', color: '#fff' });
      this.missText = this.add.text(10, 50, `Misses: ${this.misses}`, { fontSize: '32px', color: '#fff' });
  
      // Sonido de disparo
      this.gunshotSound = this.sound.add('gunshot');
    }
  
    shoot(pointer) {
      // Revisar si el disparo golpea al pato
      if (this.duck.getBounds().contains(pointer.x, pointer.y)) {
        this.gunshotSound.play();
        this.duck.setPosition(
          Phaser.Math.Between(100, this.scale.width - 100),
          Phaser.Math.Between(100, this.scale.height - 100)
        );
        this.score += 10;
        this.scoreText.setText(`Score: ${this.score}`);
  
        // Mostrar al perro celebrando
        this.showDog('celebrate');
      } else {
        // Incrementar fallos y mostrar al perro burlándose
        this.gunshotSound.play();
        this.misses += 1;
        this.missText.setText(`Misses: ${this.misses}`);
        this.showDog('mock');
  
        // Terminar el juego después de 5 fallos
        if (this.misses >= 5) {
          this.scene.restart();
        }
      }
    }
  
    showDog(animation) {
      this.dog.setPosition(this.duck.x, this.scale.height - 100);
      this.dog.setVisible(true).play(animation);
  
      // Esconder al perro después de 2 segundos
      this.time.addEvent({
        delay: 2000,
        callback: () => {
          this.dog.setVisible(false).stop();
        },
      });
    }
  }
  